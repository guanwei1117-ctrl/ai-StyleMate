#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
StyleMate 一键启动脚本
自动启动 PostgreSQL/Redis + 前后端开发服务

用法:
    python start.py                  # 一键启动（推荐）
    python start.py --no-docker      # 跳过 Docker（假定外部已有数据库）
    python start.py --no-db-wait     # 不等待 PostgreSQL 就绪（ENABLE_DB=false 时使用）
    python start.py --timeout 180    # 调整 PostgreSQL 就绪等待秒数（默认 60）
    python start.py --down-on-exit   # 退出时不询问，直接停止容器
"""

from __future__ import annotations

import argparse
import os
import shutil
import signal
import socket
import subprocess
import sys
import time

# ── 全局状态 ──────────────────────────────────────────────
ROOT = os.path.dirname(os.path.abspath(__file__))
INTERRUPTED = False

# ── 颜色常量 ──────────────────────────────────────────────
C_RESET = "\033[0m"
C_BOLD = "\033[1m"
C_DIM = "\033[2m"
C_GREEN = "\033[92m"
C_YELLOW = "\033[93m"
C_CYAN = "\033[96m"
C_RED = "\033[91m"
C_BLUE = "\033[94m"
C_MAGENTA = "\033[35m"

USE_COLOR = True


def enable_ansi():
    """启用 ANSI 颜色（非 TTY / NO_COLOR 时自动关闭）"""
    global USE_COLOR
    USE_COLOR = sys.stdout.isatty() and not os.environ.get("NO_COLOR")
    if USE_COLOR and os.name == "nt":
        try:
            import ctypes
            k32 = ctypes.windll.kernel32
            h = k32.GetStdHandle(-11)
            mode = ctypes.c_uint32()
            if k32.GetConsoleMode(h, ctypes.byref(mode)):
                k32.SetConsoleMode(h, mode.value | 0x0004)
        except Exception:
            pass


def color(text: str, code: str) -> str:
    return f"{code}{text}{C_RESET}" if USE_COLOR else text


# ── 输出辅助 ──────────────────────────────────────────────
def banner():
    print()
    print(color("  ╔════════════════════════════════════╗", C_MAGENTA))
    print(color("  ║     StyleMate — AI 穿搭助手       ║", C_MAGENTA + C_BOLD))
    print(color("  ║     一键启动开发环境              ║", C_MAGENTA + C_BOLD))
    print(color("  ╚════════════════════════════════════╝", C_MAGENTA))
    print()


def step(msg: str):
    print(color(f"▸ {msg}", C_BLUE + C_BOLD))


def ok(msg: str = "OK"):
    print(f"  {color('✓', C_GREEN)} {color(msg, C_DIM)}")


def warn(msg: str):
    print(f"  {color('⚠', C_YELLOW)} {color(msg, C_YELLOW)}")


def fail(msg: str, exit_code: int = 1):
    print(f"  {color('✗', C_RED)} {color(msg, C_RED)}")
    sys.exit(exit_code)


def info(msg: str):
    print(f"  {color(msg, C_DIM)}")


# ── 工具函数 ──────────────────────────────────────────────
def port_open(host: str, port: int, timeout: float = 1.0) -> bool:
    """检查端口是否可连接"""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def wait_for_port(host: str, port: int, timeout: int, label: str) -> bool:
    """轮询等待端口就绪，返回 True 表示就绪"""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if port_open(host, port, 0.5):
            return True
        elapsed = int(time.time() - (deadline - timeout))
        info(f"等待 {label}... ({elapsed}s/{timeout}s)")
        time.sleep(1)
    return False


def db_enabled() -> bool:
    """读取 .env 判断数据库模块是否启用（默认启用，与 app.module.ts 一致）"""
    env_file = os.path.join(ROOT, ".env")
    try:
        with open(env_file, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if line.startswith("ENABLE_DB="):
                    return line.split("=", 1)[1].strip().lower() != "false"
    except OSError:
        pass
    return True


def stop_process_tree(proc: subprocess.Popen):
    """终止进程树"""
    if proc is None or proc.poll() is not None:
        return
    try:
        if os.name == "nt":
            subprocess.run(
                ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
                capture_output=True,
                timeout=10,
            )
        else:
            proc.terminate()
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait(timeout=5)
    except Exception:
        pass


# ── 前置检查 ──────────────────────────────────────────────
def check_prerequisites(args):
    """检查前置条件"""
    step("检查前置条件")

    # Node.js
    node = shutil.which("node")
    if not node:
        fail("未找到 Node.js，请先安装 Node.js ≥ 18")
    r = subprocess.run([node, "--version"], capture_output=True, text=True)
    ver = r.stdout.strip().lstrip("v")
    major = int(ver.split(".")[0])
    if major < 18:
        warn(f"Node v{ver} < 18，推荐升级")
    ok(f"Node.js: v{ver}")

    # npm
    if not shutil.which("npm"):
        fail("未找到 npm")
    ok("npm: 可用")

    # Docker
    if not args.no_docker:
        if not shutil.which("docker"):
            fail("未找到 Docker，请安装 Docker Desktop")

        r = subprocess.run(["docker", "info"], capture_output=True, text=True)
        if r.returncode != 0:
            warn("Docker 未运行，尝试启动...")
            _start_docker_daemon()
            if not _wait_docker(30):
                fail("Docker 启动超时，请手动启动 Docker Desktop 后重试")
        ok("Docker: 运行中")

    # node_modules
    if not os.path.exists(os.path.join(ROOT, "node_modules", ".package-lock.json")):
        warn("未检测到 node_modules，请先运行: npm install")

    # .env
    if not os.path.exists(os.path.join(ROOT, ".env")):
        warn("未找到 .env，建议: cp .env.example .env")

    print()


def _start_docker_daemon():
    """尝试启动 Docker"""
    system = sys.platform
    if system == "win32":
        for p in [
            r"C:\Program Files\Docker\Docker\Docker Desktop.exe",
            r"C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe",
        ]:
            if os.path.exists(p):
                subprocess.Popen([p], shell=False)
                return
    elif system == "darwin":
        subprocess.run(["open", "-a", "Docker"], check=False)
    else:
        subprocess.run(["systemctl", "start", "docker"], check=False)


def _wait_docker(max_wait: int) -> bool:
    """等待 Docker 守护进程就绪"""
    info("等待 Docker 就绪...")
    for i in range(max_wait):
        time.sleep(1)
        try:
            r = subprocess.run(["docker", "info"], capture_output=True, text=True, timeout=5)
            if r.returncode == 0:
                return True
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
    return False


def preflight_ports():
    """检查关键端口是否已被占用"""
    conflicts = []
    for name, port in [("Web 前端 (3000)", 3000), ("API 后端 (4000)", 4000)]:
        if port_open("127.0.0.1", port, 0.3):
            conflicts.append(f"{name}:{port}")
    if conflicts:
        warn(f"以下端口已被占用: {', '.join(conflicts)}，请先停止旧进程")


# ── Docker 服务 ────────────────────────────────────────────
def start_containers():
    """启动 Docker 容器"""
    step("启动数据库容器 (PostgreSQL + Redis)")
    r = subprocess.run(
        ["docker", "compose", "up", "-d", "postgres", "redis"],
        timeout=120,
    )
    if r.returncode != 0:
        fail("docker compose up 失败，请检查: docker compose logs", exit_code=2)
    ok("容器已启动")
    print()


def wait_for_postgres(timeout: int):
    """等待 PostgreSQL 就绪"""
    if not db_enabled():
        info("ENABLE_DB=false，跳过数据库等待")
        return
    step(f"等待 PostgreSQL 就绪 (最长 {timeout}s)")
    if wait_for_port("127.0.0.1", 5432, timeout, "PostgreSQL"):
        ok("PostgreSQL 就绪")
    else:
        fail(f"PostgreSQL 在 {timeout}s 内未就绪，请检查: docker compose logs postgres", exit_code=3)
    print()


def stop_containers():
    """停止 Docker 容器"""
    step("停止数据库容器")
    subprocess.run(
        ["docker", "compose", "stop", "postgres", "redis"],
        capture_output=True,
        timeout=30,
    )
    ok("数据库容器已停止")
    print()


def ask_stop_docker(args):
    """询问是否停止 Docker 容器"""
    if args.no_docker:
        return
    if args.down_on_exit:
        stop_containers()
        return
    if args.no_down_on_exit:
        info("容器保持运行")
        return
    print()
    try:
        answer = input(
            color("是否同时停止数据库容器? [Y/n]: ", C_YELLOW)
        ).strip().lower()
    except (EOFError, KeyboardInterrupt):
        answer = "y"
    if answer in ("", "y", "yes"):
        stop_containers()
    else:
        info("容器保持运行，手动停止: docker compose stop postgres redis")
        print()


# ── 开发服务 ──────────────────────────────────────────────
def start_dev_server(args) -> subprocess.Popen:
    """启动开发服务（继承 stdio，保留 turbo 交互输出）"""
    step("启动前后端开发服务")
    info("npm run dev (turbo 启动 web + api)...")
    print()

    # 继承 stdio，让 turbo 的彩色面板正常交互
    # Windows 上 npm 实际是 npm.cmd，需要用 shutil.which 解析完整路径
    npm_path = shutil.which("npm") or "npm"
    proc = subprocess.Popen(
        [npm_path, "run", args.npm_run],
        cwd=ROOT,
        env={**os.environ, "FORCE_COLOR": "1"},
    )
    return proc


def wait_for_dev_ready(timeout: int = 90):
    """等待 Web 和 API 端口就绪"""
    step("等待开发服务就绪...")
    web_ok = wait_for_port("127.0.0.1", 3000, timeout, "Web :3000")
    api_ok = wait_for_port("127.0.0.1", 4000, min(timeout, 30), "API :4000")

    if not web_ok:
        warn("Web 前端 (3000) 未在预期时间内就绪，可能仍在编译")
    if not api_ok:
        warn("API 后端 (4000) 未在预期时间内就绪，可能仍在编译")
    if web_ok and api_ok:
        ok("所有服务就绪")
    print()


def print_ready():
    """打印就绪信息"""
    print(color("  ┌───────────────────────────────────────────┐", C_GREEN + C_BOLD))
    print(color("  │  🎉 项目启动成功!                         │", C_GREEN + C_BOLD))
    print(color("  ├───────────────────────────────────────────┤", C_GREEN + C_BOLD))
    print(f"  │  Web 前端:  http://localhost:3000        {color('│', C_GREEN + C_BOLD)}")
    print(f"  │  API 文档:  http://localhost:4000/api/docs{color('│', C_GREEN + C_BOLD)}")
    print(f"  │  健康检查:  http://localhost:4000/api/v1/health{color('│', C_GREEN + C_BOLD)}")
    print(color("  ├───────────────────────────────────────────┤", C_GREEN + C_BOLD))
    print(f"  │  {color('按 Ctrl+C 停止所有服务', C_YELLOW)}                {color('│', C_GREEN + C_BOLD)}")
    print(color("  └───────────────────────────────────────────┘", C_GREEN + C_BOLD))
    print()


# ── 信号 / 关闭处理 ───────────────────────────────────────
_shutdown_done = False
_dev_proc: subprocess.Popen | None = None
_args = None


def _on_signal(signum, frame):
    global _shutdown_done
    if _shutdown_done:
        return
    _shutdown_done = True
    print()
    print()
    step("正在停止开发服务...")
    stop_process_tree(_dev_proc)
    ok("开发服务已停止")
    ask_stop_docker(_args)
    print(color("再见! 👋", C_GREEN + C_BOLD))
    sys.exit(0)


# ── 主流程 ─────────────────────────────────────────────────
def parse_args():
    p = argparse.ArgumentParser(
        description="StyleMate 一键启动脚本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python start.py                    一键启动
  python start.py --no-docker        已有数据库，只启动前后端
  python start.py --no-db-wait       ENABLE_DB=false 时不等待数据库
  python start.py --down-on-exit     退出时自动停止容器
  python start.py --timeout 180      延长数据库等待时间
        """,
    )
    p.add_argument(
        "--no-docker",
        action="store_true",
        help="跳过 Docker 容器启动和停止（数据库已在外部运行时使用）",
    )
    p.add_argument(
        "--timeout",
        type=int,
        default=60,
        help="PostgreSQL 就绪等待秒数（默认 60）",
    )
    p.add_argument(
        "--no-db-wait",
        action="store_true",
        help="不等待 PostgreSQL 就绪（与 ENABLE_DB=false 配合使用）",
    )
    p.add_argument(
        "--down-on-exit",
        action="store_true",
        help="退出时直接停止容器，不询问",
    )
    p.add_argument(
        "--no-down-on-exit",
        action="store_true",
        help="退出时不停容器，不询问",
    )
    p.add_argument(
        "--npm-run",
        default="dev",
        help="npm script 名称（默认 dev）",
    )
    return p.parse_args()


def main():
    global _dev_proc, _args
    os.chdir(ROOT)
    _args = parse_args()
    enable_ansi()

    banner()
    preflight_ports()
    check_prerequisites(_args)

    # 1. 启动 Docker（除非跳过）
    if not _args.no_docker:
        start_containers()
        if not _args.no_db_wait:
            wait_for_postgres(_args.timeout)

    # 2. 启动开发服务
    _dev_proc = start_dev_server(_args)

    # 3. 等待服务就绪
    wait_for_dev_ready()

    print_ready()

    # 4. 设置信号处理
    signal.signal(signal.SIGINT, _on_signal)
    signal.signal(signal.SIGTERM, _on_signal)

    # 5. 等待进程结束
    try:
        _dev_proc.wait()
    except KeyboardInterrupt:
        pass

    # 6. 正常退出（非 Ctrl+C 路径）
    if not _shutdown_done:
        rc = _dev_proc.returncode
        if rc != 0:
            warn(f"开发进程退出码: {rc}")
        ask_stop_docker(_args)
        print(color("再见! 👋", C_GREEN + C_BOLD))


if __name__ == "__main__":
    main()
