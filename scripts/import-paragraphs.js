import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') })

// 从环境变量读取Supabase配置
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少Supabase配置，请检查环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function importParagraphs() {
  try {
    // 读取JSON数据
    const jsonPath = path.join(__dirname, '../public/shanghai_astronomy_museum.json')
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    
    console.log(`准备导入 ${jsonData.length} 个段落...`)
    
    // 批量插入数据
    const batchSize = 50
    for (let i = 0; i < jsonData.length; i += batchSize) {
      const batch = jsonData.slice(i, i + batchSize)
      
      const insertData = batch.map(item => ({
        custom_id: item.id,
        title: item.title,
        content: item.content,
        section: item.section,
        order_index: i + batch.indexOf(item) + 1,
        fill_blanks: {
          text: item.fill_blanks,
          answers: item.fill_blanks_answers
        },
        potential_qa: item.voice_check_phrases ? [item.voice_check_phrases] : []
      }))
      
      const { data, error } = await supabase
        .from('paragraphs')
        .upsert(insertData, { 
          onConflict: 'custom_id',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error(`批次 ${Math.floor(i/batchSize) + 1} 导入失败:`, error)
      } else {
        console.log(`批次 ${Math.floor(i/batchSize) + 1} 导入成功 (${batch.length} 条记录)`)
      }
    }
    
    console.log('数据导入完成！')
    
  } catch (error) {
    console.error('导入过程中发生错误:', error)
    process.exit(1)
  }
}

importParagraphs()