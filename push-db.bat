@echo off
setlocal enabledelayedexpansion
set "DATABASE_URL=postgresql://postgres.nheqczaprzwmstmdcxhb:Ariful252201@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres"
cd /d "c:\Users\arifu\OneDrive\Desktop\STR"
npx prisma db push
pause
