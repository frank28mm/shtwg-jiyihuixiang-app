-- 添加custom_id字段到paragraphs表
ALTER TABLE paragraphs ADD COLUMN custom_id VARCHAR(50) UNIQUE;

-- 创建索引以提高查询性能
CREATE INDEX idx_paragraphs_custom_id ON paragraphs(custom_id);

-- 添加注释
COMMENT ON COLUMN paragraphs.custom_id IS '自定义段落ID，格式如p-00-01-01';