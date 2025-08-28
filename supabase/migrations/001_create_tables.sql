-- 创建段落内容表 (paragraphs)
CREATE TABLE paragraphs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    section VARCHAR(100) NOT NULL,
    order_index INTEGER NOT NULL,
    fill_blanks JSONB DEFAULT '[]'::jsonb,
    potential_qa JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_paragraphs_section ON paragraphs(section);
CREATE INDEX idx_paragraphs_order ON paragraphs(order_index);

-- 启用RLS
ALTER TABLE paragraphs ENABLE ROW LEVEL SECURITY;

-- 设置访问策略
CREATE POLICY "Allow read access to all users" ON paragraphs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read access to anonymous users" ON paragraphs
    FOR SELECT TO anon USING (true);

-- 创建用户进度表 (user_progress)
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id UUID REFERENCES paragraphs(id) ON DELETE CASCADE,
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level >= 0 AND mastery_level <= 100),
    practice_count INTEGER DEFAULT 0,
    last_practiced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    training_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_paragraph_id ON user_progress(paragraph_id);
CREATE UNIQUE INDEX idx_user_progress_unique ON user_progress(user_id, paragraph_id);

-- 启用RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- 设置访问策略
CREATE POLICY "Users can view own progress" ON user_progress
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON user_progress
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON user_progress
    FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 创建用户复述评估表 (user_paraphrase_evaluations)
CREATE TABLE user_paraphrase_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    paragraph_id UUID REFERENCES paragraphs(id) ON DELETE CASCADE,
    paraphrased_text TEXT NOT NULL,
    evaluation_result JSONB NOT NULL,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_paraphrase_evaluations_user_id ON user_paraphrase_evaluations(user_id);
CREATE INDEX idx_paraphrase_evaluations_paragraph_id ON user_paraphrase_evaluations(paragraph_id);
CREATE INDEX idx_paraphrase_evaluations_created_at ON user_paraphrase_evaluations(created_at DESC);
CREATE INDEX idx_paraphrase_evaluations_score ON user_paraphrase_evaluations(score DESC);

-- 启用RLS
ALTER TABLE user_paraphrase_evaluations ENABLE ROW LEVEL SECURITY;

-- 设置访问策略
CREATE POLICY "Users can view own evaluations" ON user_paraphrase_evaluations
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own evaluations" ON user_paraphrase_evaluations
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 初始化示例数据
INSERT INTO paragraphs (title, content, section, order_index, fill_blanks) VALUES
('地球 - 我们的家园', '我们的家园地球，是太阳系中一颗充满生机的蓝色星球。它的直径约为12742公里，是距离太阳第三近的行星。', '家园展区', 1, 
'[{"text": "我们的家园地球，是太阳系中一颗充满", "blank": "生机", "options": ["生机", "活力", "生命"]}, {"text": "的蓝色星球。它的直径约为", "blank": "12742", "options": ["12742", "12756", "12734"]}]');