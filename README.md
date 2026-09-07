# Zangetsu Etalase

Platform etalase jasa pembuatan website kampus dengan sistem referral, komisi, dan multi-role dashboard.

## Fitur

### Database & Models
- **User** - dengan role: Member, Affiliator, Super Admin
- **Product** - paket jasa website dengan harga, fitur, dan gambar
- **ProductImage** - multiple images per produk
- **Order** - sistem pesanan dengan status tracking
- **Click** - tracking klik/view produk
- **Chat** - sistem chat support
- **Referral** - sistem referral dengan kode unik
- **Commission** - komisi dari referral
- **Earning** - riwayat penghasilan
- **Withdrawal** - penarikan saldo
- **Theme** - kustomisasi tampilan
- **Token** - sistem token reward

### Panel Dashboard

#### Member Panel (`/member`)
- Dashboard dengan statistik pesanan, komisi, klik, saldo
- Etalase produk
- Riwayat pesanan
- Riwayat komisi
- Pengajuan withdrawal
- Chat support
- Profil & kode referral

#### Affiliator Panel (`/affiliator`)
- Dashboard dengan performa referral
- CRUD produk (tambah, edit, hapus)
- Manajemen pesanan
- Daftar user referral
- Link referral
- Withdrawal
- Pengaturan

#### Super Admin Panel (`/superadmin`)
- Dashboard global dengan semua statistik
- Manajemen semua produk
- Manajemen semua pesanan
- Manajemen semua user (ubah role, status, saldo)
- Manajemen referral
- Manajemen komisi
- Proses withdrawal
- Manajemen token
- Manajemen tema
- Analytics & statistik
- Pengaturan sistem

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **Auth**: NextAuth.js (Credentials Provider)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Deployment**: Vercel

## Setup Local

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Clone & Install
```bash
cd "jasa web"
npm install
```

### 2. Setup Database
Buat database PostgreSQL:
```sql
CREATE USER zangetsu WITH PASSWORD 'zangetsu123';
CREATE DATABASE zangetsu_etalase OWNER zangetsu;
```

### 3. Setup Environment
```bash
cp .env.example .env
# Edit .env dengan database credentials Anda
```

### 4. Setup Prisma
```bash
npx prisma db push
npx prisma generate
npm run db:seed
```

### 5. Run Development
```bash
npm run dev
```

Buka http://localhost:3000

## Login Credentials (Demo)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@zangetsu.com | admin123 |
| Affiliator | affiliator@zangetsu.com | aff123 |
| Member | member@zangetsu.com | member123 |

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Setup Database untuk Production
Opsi A: **Vercel Postgres** (recommended)
- Di dashboard Vercel, buat Postgres database
- Connect ke project Anda
- `DATABASE_URL` akan otomatis terisi

Opsi B: **Supabase**
- Buat project di supabase.com
- Copy connection string
- Set `DATABASE_URL` di Vercel environment variables

### 3. Set Environment Variables di Vercel
```
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=<generate dengan: openssl rand -base64 32>
NEXT_PUBLIC_APP_NAME=Zangetsu Etalase
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 4. Deploy
- Import project di vercel.com
- Framework: Next.js
- Build Command: `npm run build`
- Install Command: `npm install`
- Klik Deploy

### 5. Post-Deploy
Setelah deploy, jalankan migration:
```bash
npx prisma db push
npm run db:seed
```

Atau gunakan Vercel CLI:
```bash
vercel env pull .env.production.local
npx prisma db push
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Registrasi user baru
- `POST /api/auth/[...nextauth]` - NextAuth handlers

### Products
- `GET /api/products` - List produk (public)
- `POST /api/affiliator/products` - Buat produk (affiliator)
- `PUT /api/affiliator/products/[id]` - Update produk
- `DELETE /api/affiliator/products/[id]` - Hapus produk
- `POST /api/products/[id]/click` - Track klik

### Orders
- `GET /api/orders` - List pesanan user
- `POST /api/orders` - Buat pesanan baru
- `PATCH /api/orders/[id]` - Update status pesanan

### Withdrawals
- `GET /api/withdrawals` - List withdrawal user
- `POST /api/withdrawals` - Ajukan withdrawal

### Chat
- `GET /api/chat` - List chat user
- `POST /api/chat` - Buat chat baru
- `GET /api/chat/[id]/messages` - Get messages
- `POST /api/chat/[id]/messages` - Kirim pesan

### Super Admin
- `PATCH /api/superadmin/users/[id]` - Update user
- `DELETE /api/superadmin/users/[id]` - Hapus user
- `PATCH /api/superadmin/withdrawals/[id]` - Proses withdrawal

### Upload
- `POST /api/upload` - Upload gambar

## Project Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/               # Authentication
│   │   ├── products/           # Product APIs
│   │   ├── orders/             # Order APIs
│   │   ├── withdrawals/        # Withdrawal APIs
│   │   ├── chat/               # Chat APIs
│   │   ├── upload/             # Image upload
│   │   ├── affiliator/         # Affiliator APIs
│   │   └── superadmin/         # Super Admin APIs
│   ├── member/                 # Member panel pages
│   ├── affiliator/             # Affiliator panel pages
│   ├── superadmin/             # Super Admin panel pages
│   ├── login/                  # Login page
│   ├── register/               # Register page
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage (etalase publik)
│   └── globals.css             # Global styles
├── components/
│   ├── ui/                     # Shared UI components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── StatCard.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Badge.tsx
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── DashboardLayout.tsx
│   │   └── WithdrawalForm.tsx
│   └── providers/              # Context providers
│       └── SessionProvider.tsx
├── lib/
│   ├── prisma.ts               # Prisma client
│   ├── auth.ts                 # NextAuth config
│   └── utils.ts                # Utility functions
├── types/
│   └── next-auth.d.ts          # NextAuth type declarations
└── middleware.ts               # Route protection

prisma/
├── schema.prisma               # Database schema
└── seed.ts                     # Seed data
```

## License

MIT
