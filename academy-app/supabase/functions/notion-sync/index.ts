// Supabase Edge Function: notion-sync
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY')!
const NOTION_DATABASE_ID = Deno.env.get('NOTION_DATABASE_ID')!
const NOTION_VERSION = '2022-06-28'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const student = await req.json()

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          이름: { title: [{ text: { content: student.name ?? '' } }] },
          ...(student.birth_date
            ? { 생년월일: { date: { start: student.birth_date } } }
            : {}),
          학교: { rich_text: [{ text: { content: student.school ?? '' } }] },
          학년: { rich_text: [{ text: { content: student.grade ?? '' } }] },
          '본인 연락처': { rich_text: [{ text: { content: student.phone ?? '' } }] },
          '보호자 연락처': { rich_text: [{ text: { content: student.guardian_phone ?? '' } }] },
          주소: { rich_text: [{ text: { content: student.address ?? '' } }] },
          '차량 탑승': { checkbox: student.uses_shuttle ?? false },
          '탑승 장소': { rich_text: [{ text: { content: student.shuttle_pickup ?? '' } }] },
          '하원 장소': { rich_text: [{ text: { content: student.shuttle_dropoff ?? '' } }] },
          메모: { rich_text: [{ text: { content: student.notes ?? '' } }] },
          '개인정보 동의': { checkbox: student.privacy_consent ?? false },
          '법정대리인 동의': { checkbox: student.guardian_consent ?? false },
          '마케팅 동의': { checkbox: student.marketing_consent ?? false },
        },
      }),
    })

    const data = await notionRes.json()

    if (!notionRes.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: notionRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, notionPageId: data.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})