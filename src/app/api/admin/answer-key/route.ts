import { NextResponse } from 'next/server';
import { getAdminAuthSession } from '@/lib/auth-session';
import {
  HYUNDAI_R2_QUESTIONS,
  ETERNAL_R2_QUESTIONS,
  CLOUDFLARE_R2_QUESTIONS,
  DIOR_R2_QUESTIONS
} from '@/lib/questions-data';

export async function GET(request: Request) {
  const adminSession = await getAdminAuthSession(request);
  if (!adminSession) {
    return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const caseId = searchParams.get('case_id');

  const keys: Record<string, any> = {
    'case-r2-hyundai': {
      case_id: 'case-r2-hyundai',
      case_title: 'Hyundai Motor India IPO & EV Strategy',
      questions: HYUNDAI_R2_QUESTIONS
    },
    'case-r2-eternal': {
      case_id: 'case-r2-eternal',
      case_title: 'Eternal Ltd (Zomato & Blinkit)',
      questions: ETERNAL_R2_QUESTIONS
    },
    'case-r2-cloudflare': {
      case_id: 'case-r2-cloudflare',
      case_title: 'Cloudflare Edge AI & Cybersecurity',
      questions: CLOUDFLARE_R2_QUESTIONS
    },
    'case-r2-dior': {
      case_id: 'case-r2-dior',
      case_title: 'Dior Supply Chain & Counterfeit Fraud',
      questions: DIOR_R2_QUESTIONS
    }
  };

  if (caseId && keys[caseId]) {
    return NextResponse.json({ success: true, answer_key: keys[caseId] });
  }

  return NextResponse.json({ success: true, answer_keys: keys });
}
