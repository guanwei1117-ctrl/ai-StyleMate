 # 决策权重系统 — 4:4:2 三重决策引擎
 
 ## 权重配比总则
 
 **最终穿搭建议 = AI分析(40%) + Skill规则(40%) + 用户记忆(20%)**
 
 这是整体权重分配。但在不同决策阶段，各因素的参与程度不同：
 
 | 决策环节 | AI权重 | Skill权重 | 记忆权重 | 说明 |
 |---------|--------|----------|----------|------|
 | 体型判断 | 60% | 30% | 10% | AI从图片分析体型最精准 |
 | 颜色推荐 | 20% | 60% | 20% | 颜色规则是硬知识，AI辅助调整 |
 | 风格推荐 | 30% | 30% | 40% | 风格偏好高度个人化 |
 | 单品选择 | 40% | 40% | 20% | AI+Skill共同决定，记忆微调 |
 | 场合匹配 | 20% | 70% | 10% | 场合规则是刚性的 |
 | 最终方案选择 | 30% | 30% | 40% | 用户避雷清单有一票否决权 |
 
 ## 三层决策算法（伪代码逻辑）
 
 ```
 当用户上传图片/描述需求:
 
 // 第1层: AI分析层 (40%)
 ai_analysis = {
     body_shape: analyze_body_shape(image),      // 从图片分析体型
     skin_tone: analyze_skin_tone(image),         // 肤色分析
     current_outfit: analyze_current_outfit(image), // 现有穿搭分析
     vibe: analyze_vibe(image),                    // 气质风格判断
     gender: detect_gender(image),                 // 性别判断
 }
 
 // 第2层: Skill规则层 (40%)
 skill_rules = load_rules_by_gender(ai_analysis.gender)
 matched_rules = []
 
 for rule in skill_rules:
     if rule.matches(ai_analysis):
         matched_rules.append(rule)
 
 // 规则冲突时按优先级处理
 // 优先级: 场合 > 体型 > 比例 > 颜色 > 风格 > 材质
 resolved_rules = resolve_conflicts(matched_rules)
 
 // 第3层: 用户记忆层 (20%)
 user_memory = load_user_memory(user_id)
 
 memory_hits = {
     liked_styles: user_memory.get_liked_styles(),       // 历史喜欢的风格
     disliked_items: user_memory.get_disliked_items(),   // 避雷清单
     past_good_outfits: user_memory.get_past_good(),     // 历史好评搭配
     brand_preferences: user_memory.get_brand_prefs(),   // 品牌偏好
     color_preferences: user_memory.get_color_prefs(),   // 颜色偏好
     fit_preferences: user_memory.get_fit_prefs(),       // 版型偏好
 }
 
 // 方案生成
 candidates = []
 
 // 方案A: AI主导方案 (基于AI分析+部分Skill)
 candidates.append(generate_ai_driven(ai_analysis, resolved_rules))
 
 // 方案B: Skill主导方案 (基于规则+AI微调)
 candidates.append(generate_skill_driven(resolved_rules, ai_analysis))
 
 // 方案C: 混合优化方案 (交叉验证取最优)
 candidates.append(generate_hybrid(ai_analysis, resolved_rules))
 
 // 用户记忆过滤
 for candidate in candidates:
     // 一票否决：如果方案包含用户避雷项，直接排除
     if contains_disliked_items(candidate, memory_hits.disliked_items):
         candidates.remove(candidate)
         continue
     
     // 偏好加分：符合历史喜好的方案获得加成
     candidate.score += calculate_preference_score(candidate, memory_hits)
 
 // 最终排序输出
 sort_by_score(candidates)
 output_top_n(candidates, 3)
 ```
 
 ## 规则优先级体系
 
 当多条规则冲突时，按以下优先级裁决：
 
 | 优先级 | 规则类型 | 理由 |
 |--------|---------|------|
 | 1 (最高) | **场合规则** | 不得体=穿搭失败 |
 | 2 | **体型规则** | 修饰身材是穿搭核心 |
 | 3 | **比例规则** | 影响整体视觉 |
 | 4 | **颜色规则** | 影响第一印象 |
 | 5 | **风格规则** | 可灵活调整 |
 | 6 (最低) | **材质规则** | 属于进阶优化 |
 
 ## AI突破规则的条件
 
 AI可以突破Skill规则，但必须满足以下条件之一并进行说明：
 
 1. **潮流趋势**：当前流行趋势与规则相反（如Y2K的低腰风违反了"高腰显高"规则）
 2. **风格需要**：特定风格需要违反规则（如Vintage工装风的宽松叠穿可能违反"上窄下宽"）
 3. **个人特色**：用户有独特气质或特征，规则型方案反而压抑个性
 4. **创意实验**：作为方案选项之一提供给用户（需标注为"创意方案"）
 
 突破规则时，格式示例：
 ```
 📐 Skill规则建议：[规则原文]
 🤖 AI调整理由：[突破规则的具体原因]
 ```
 
 ## 用户记忆数据结构参考
 
 ```json
 {
   "user_id": "xxx",
   "preferred_styles": ["法式", "极简"],
   "disliked_styles": ["运动", "Y2K"],
   "disliked_colors": ["荧光绿", "亮紫色"],
   "disliked_items": ["高领", "紧身裤", "厚底鞋"],
   "disliked_materials": ["蕾丝", "亮片"],
   "liked_brands": ["Uniqlo", "COS"],
   "body_info": {
     "height": 168,
     "weight": 55,
     "body_shape": "梨型",
     "skin_tone": "暖黄皮",
     "shoulder_width": "正常",
     "leg_proportion": "五五分"
   },
   "past_positive_outfits": [
     {"description": "米色针织+深蓝阔腿裤+小白鞋", "feedback": "很好", "date": "2025-01-15"}
   ],
   "past_negative_outfits": [
     {"description": "黑色高领毛衣+包臀裙", "feedback": "显胖", "date": "2025-02-01"}
   ]
 }
 ```
 
 ## 注意事项
 
 - 用户记忆的"一票否决权"仅适用于用户明确表达不喜欢的元素（避雷清单）
 - 未知偏好的用户，记忆权重自动降为0%，AI和Skill各占50%
 - 记忆数据应在用户授权后收集，不能无端假设
 - Skill规则更新时，无需修改用户记忆数据
