# NekoVi - Anime E-commerce Website

A modern, responsive anime e-commerce website built with Next.js 14, featuring a vibrant pink theme inspired by anime culture. This project follows clean architecture principles and includes a complete customer-facing shopping experience.

## Features

### Core Functionality
- **Home Page**: Hero banner carousel, featured products, category showcase, and customer testimonials
- **Product Browsing**: Filterable product list with search, sorting, price ranges, and pagination
- **Product Details**: Image gallery, quantity selector, stock status, and related products
- **Shopping Cart**: Add/remove items, quantity management, voucher support, and order summary
- **Checkout**: Customer information form, payment method selection, and order review
- **Order History**: View past orders with status tracking and search functionality
- **User Authentication**: Login, register, and profile management (with bypass for development)
- **Theme Support**: Full dark and light mode with smooth transitions

### Design Features
- Vibrant pink (#FF69B4) primary color scheme
- Fully responsive design (mobile, tablet, desktop)
- Vietnamese language support
- Anime-themed imagery and branding
- Clean, modern UI with shadcn/ui components
- Smooth animations and transitions

## Project Structure (Clean Architecture)

\`\`\`
├── app/                          # Next.js App Router pages
│   ├── cart/                     # Shopping cart page
│   ├── checkout/                 # Checkout flow
│   ├── login/                    # Login page
│   ├── orders/                   # Order history
│   ├── products/                 # Product list and detail
│   ├── profile/                  # User profile
│   ├── register/                 # Registration page
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles and theme
│
├── core/                         # Core business logic
│   ├── lib/
│   │   └── mock-data.ts          # Mock product and user data
│   └── providers/
│       ├── auth-provider.tsx     # Authentication context
│       └── cart-provider.tsx     # Shopping cart context
│
├── features/                     # Feature-specific components
│   └── product/
│       └── product-card.tsx      # Reusable product card
│
├── widgets/                      # Page-level composite components
│   ├── home/
│   │   ├── hero-banner.tsx       # Hero carousel
│   │   ├── featured-products.tsx # Featured products section
│   │   ├── category-showcase.tsx # Category cards
│   │   └── testimonials.tsx      # Customer reviews
│   └── layout/
│       ├── navbar.tsx            # Main navigation
│       ├── footer.tsx            # Site footer
│       ├── theme-toggle.tsx      # Dark/light mode toggle
│       └── main-layout.tsx       # Page wrapper
│
├── shared/                       # Shared utilities
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── utils/
│   │   └── format.ts             # Formatting utilities
│   └── hooks/
│       └── use-theme.tsx         # Theme management hook
│
├── components/                   # shadcn/ui components
│   └── ui/                       # Button, Input, Card, etc.
│
└── public/                       # Static assets
    └── *.jpg, *.png              # Images and media
\`\`\`

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **Image Optimization**: Next.js Image component

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository or download the ZIP file

2. Install dependencies:
\`\`\`bash
npm install
# or
yarn install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Key Pages

### Home Page (`/`)
- Hero banner with anime series showcases
- Featured product sections
- Category cards (Cosplay, Figures, Merchandise)
- Customer testimonials

### Products (`/products`)
- Search functionality
- Filters: Sort by, Price range, Category
- Pagination
- Responsive grid layout

### Product Detail (`/products/[id]`)
- Image gallery with thumbnails
- Product information and pricing
- Quantity selector
- Add to cart / Buy now
- Related products

### Shopping Cart (`/cart`)
- Item list with images
- Quantity controls
- Remove items
- Voucher/discount code input
- Order summary

### Checkout (`/checkout`)
- Customer information form
- Shipping address
- Payment method selection (Bank transfer, COD)
- Order review

### Order History (`/orders`)
- Order status tabs
- Search orders
- Order details with product images
- Status badges

### Authentication
- Login page with anime artwork
- Registration with social login options
- Profile management with avatar upload
- **Note**: Authentication is bypassed for development - any credentials will work

## Theme Customization

The theme is defined in `app/globals.css` using CSS variables:

\`\`\`css
@theme inline {
  --color-primary: #ff69b4;      /* Pink */
  --color-secondary: #4ade80;    /* Green */
  --color-accent: #fbbf24;       /* Yellow */
  /* ... more theme variables */
}
\`\`\`

Toggle between light and dark mode using the theme toggle in the navbar.

## Mock Data

The application uses mock data for development:
- **Products**: 20+ anime products (cosplay, figures, merchandise)
- **Users**: Pre-configured test user
- **Orders**: Sample order history

Mock data is located in `core/lib/mock-data.ts`

## Features in Detail

### Authentication (Bypass Mode)
- Login with any email/password combination
- Registration creates a mock user
- Profile updates are stored in context
- Redirects to login for protected pages

### Shopping Cart
- Persistent cart state using React Context
- Add/remove items
- Update quantities
- Calculate totals with discounts
- Clear cart after checkout

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile menu for navigation
- Optimized layouts for all screen sizes

## Future Enhancements

- Real backend API integration
- Database connection (Supabase/Neon)
- Real authentication with JWT
- Payment gateway integration (Stripe)
- Order tracking system
- Product reviews and ratings
- Wishlist functionality
- Admin dashboard

## Vietnamese Language Support

All UI text is in Vietnamese:
- Navigation: Anime, Sản Phẩm, Bảng tin, Câu chuyện
- Forms: Đăng nhập, Đăng ký, Thanh toán
- Actions: Thêm vào giỏ hàng, Mua ngay
- Status: Đang giao hàng, Hoàn thành

## License

This project is for educational and demonstration purposes.

## Credits

- Design inspired by NekoVi anime e-commerce brand
- UI components from shadcn/ui
- Icons from Lucide React
- Images from various anime series (Demon Slayer, One Piece, etc.)
