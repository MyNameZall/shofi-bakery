import { useState, useEffect, useRef } from 'react'
import './App.css'

const WA_NUMBER = '6281234567890' // Ganti dengan nomor WA pemilik toko

const menuItems = [
  {
    id: 1,
    name: 'Roti Tawar Premium',
    desc: 'Dibuat dari susu segar pilihan, teksturnya super lembut dan mengembang sempurna setiap hari.',
    price: 'Rp 20.000',
    img: '/roti.webp',
    tag: 'Best Seller',
    tagColor: '#e53e3e',
  },
  {
    id: 2,
    name: 'Croissant Butter',
    desc: 'Lapis demi lapis butter asli Prancis, renyah di luar dan meleleh di dalam.',
    price: 'Rp 25.000',
    img: '/croissant.webp',
    tag: 'Favorit',
    tagColor: '#7c3aed',
  },
  {
    id: 3,
    name: 'Kue Cokelat Klasik',
    desc: 'Dark chocolate premium dengan ganache glossy, manis yang seimbang dan bikin ketagihan.',
    price: 'Rp 45.000',
    img: '/kue.webp',
    tag: 'Spesial',
    tagColor: '#d97706',
  },
  {
    id: 4,
    name: 'Roti Kayu Manis',
    desc: 'Gulugan roti hangat dengan cinnamon sugar dan cream cheese frosting yang legit.',
    price: 'Rp 30.000',
    img: '/roti.webp',
    tag: 'Baru',
    tagColor: '#059669',
  },
  {
    id: 5,
    name: 'Pain au Chocolat',
    desc: 'Pastri berlapis dengan batangan cokelat di dalamnya, aroma harum saat dipanggang.',
    price: 'Rp 28.000',
    img: '/croissant.webp',
    tag: 'Favorit',
    tagColor: '#7c3aed',
  },
  {
    id: 6,
    name: 'Lapis Surabaya',
    desc: 'Kue lapis tradisional khas Indonesia dengan tekstur lembut dan kaya mentega.',
    price: 'Rp 65.000',
    img: '/kue.webp',
    tag: 'Signature',
    tagColor: '#b91c1c',
  },
]

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useInView()
  return (
    <div ref={ref} className={`reveal ${visible ? 'revealed' : ''} ${className}`}>
      {children}
    </div>
  )
}

export default function App() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [toast, setToast] = useState('')
  const [imgError, setImgError] = useState(false)

  // ── CART STATES & LOGIC ──
  interface CartItem {
    id: number;
    name: string;
    price: string;
    img: string;
    quantity: number;
  }

  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [custName, setCustName] = useState('')
  const [custAddress, setCustAddress] = useState('')
  const [custNotes, setCustNotes] = useState('')

  const parsePrice = (priceStr: string): number => {
    return parseInt(priceStr.replace(/[^0-9]/g, ''), 10)
  }

  const formatPrice = (num: number): string => {
    return 'Rp ' + num.toLocaleString('id-ID')
  }

  const addToCart = (item: typeof menuItems[0]) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, img: item.img, quantity: 1 }]
    })
    setToast(`Ditambahkan ke keranjang: ${item.name}`)
    setTimeout(() => setToast(''), 2000)
  }

  const removeFromCart = (id: number) => {
    const item = cart.find(i => i.id === id)
    setCart(prev => prev.filter(i => i.id !== id))
    if (item) {
      setToast(`Dihapus dari keranjang: ${item.name}`)
      setTimeout(() => setToast(''), 2000)
    }
  }

  const increaseQty = (id: number) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
  }

  const decreaseQty = (id: number) => {
    const existing = cart.find(i => i.id === id)
    if (existing && existing.quantity === 1) {
      removeFromCart(id)
    } else {
      setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
    }
  }

  const getItemQty = (id: number) => {
    const item = cart.find(i => i.id === id)
    return item ? item.quantity : 0
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + (parsePrice(item.price) * item.quantity), 0)

  const handleCartOrder = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    if (!custName.trim() || !custAddress.trim()) {
      setToast('Silakan isi nama dan alamat pengiriman!')
      setTimeout(() => setToast(''), 3000)
      return
    }

    const itemsText = cart.map(item => {
      const sub = parsePrice(item.price) * item.quantity
      return `- *${item.quantity}x ${item.name}* (@${item.price})\n  Subtotal: *${formatPrice(sub)}*`
    }).join('\n\n')

    const msg = encodeURIComponent(
      `Halo Shofi Bakery! Saya ingin memesan:\n\n` +
      `*RINCIAN PESANAN:*\n` +
      `----------------------------------------\n` +
      `${itemsText}\n\n` +
      `----------------------------------------\n` +
      `*Total Pembayaran: ${formatPrice(totalPrice)}*\n\n` +
      `*INFORMASI PENGIRIMAN:*\n` +
      `- *Nama:* ${custName.trim()}\n` +
      `- *Alamat:* ${custAddress.trim()}\n` +
      (custNotes.trim() ? `- *Catatan:* ${custNotes.trim()}\n` : '') +
      `\nMohon konfirmasi ketersediaan dan total ongkirnya. Terima kasih!`
    )

    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
    setToast('Membuka WhatsApp untuk mengirim pesanan...')
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    setTimeout(() => setHeroLoaded(true), 100)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
    setMenuOpen(false)
  }

  const navLinks = [
    { label: 'Beranda', id: 'home' },
    { label: 'Menu', id: 'menu' },
    { label: 'Tentang', id: 'tentang' },
    { label: 'Kontak', id: 'kontak' },
  ]

  return (
    <div className="app">

      {/* Toast notification */}
      <div className={`toast ${toast ? 'toast-show' : ''}`}>{toast}</div>

      {/* ── NAVBAR ── */}
      <header className={`navbar ${scrolled ? 'scrolled' : ''} ${menuOpen ? 'menu-open' : ''}`}>
        <div className="nav-inner">
          <button className="nav-brand" onClick={() => scrollTo('home')} aria-label="Beranda">
            <span className="brand-logo">SB</span>
            <span className="brand-name">Shofi Bakery</span>
          </button>

          <nav className="nav-links" aria-label="Navigasi utama">
            {navLinks.map(l => (
              <button key={l.id} className="nav-link" onClick={() => scrollTo(l.id)}>
                {l.label}
              </button>
            ))}
          </nav>

          <button
            id="btn-pesan-sekarang"
            className="nav-cta"
            onClick={() => scrollTo('menu')}
            type="button"
          >
            Pesan Sekarang
          </button>

          <button
            className="nav-cart-trigger"
            onClick={() => setIsCartOpen(true)}
            aria-label="Keranjang Belanja"
            type="button"
            style={{ marginLeft: '10px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalItems > 0 && <span className="nav-cart-badge">{totalItems}</span>}
          </button>

          <button
            className="hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
          {navLinks.map(l => (
            <button key={l.id} className="mobile-link" onClick={() => scrollTo(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="mobile-cta" onClick={() => scrollTo('menu')}>
            Pesan Sekarang
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section id="home" className="hero">
        <div className="hero-bg-wrap">
          <img src="/hero.webp" alt="Shofi Bakery" className="hero-bg-img" fetchPriority="high" />
          <div className="hero-overlay" />
          <div className="hero-gradient" />
        </div>

        {/* Floating decorative shapes */}
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />

        <div className={`hero-content ${heroLoaded ? 'loaded' : ''}`}>
          <div className="hero-eyebrow">
            <span className="eyebrow-dot" />
            Freshly Baked Every Day
          </div>
          <h1 className="hero-title">
            Roti &amp; Kue Artisan<br />
            <span className="title-gradient">Shofi Bakery</span>
          </h1>
          <p className="hero-sub">
            Kami memanggang dengan cinta setiap hari sejak 2018.<br />
            Dari roti sederhana hingga kue spesial &mdash; semua dibuat dari bahan terbaik.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => scrollTo('menu')}>
              Lihat Menu Kami
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn-outline" onClick={() => scrollTo('tentang')}>
              Tentang Kami
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-n">50+</span>
              <span className="stat-l">Varian Menu</span>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-n">5000+</span>
              <span className="stat-l">Pelanggan Puas</span>
            </div>
            <div className="stat-sep" />
            <div className="stat">
              <span className="stat-n">6 Thn</span>
              <span className="stat-l">Pengalaman</span>
            </div>
          </div>
        </div>

        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE STRIP ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {['Roti Tawar Premium', 'Croissant Butter', 'Kue Cokelat', 'Pain au Chocolat', 'Lapis Surabaya', 'Roti Kayu Manis',
            'Roti Tawar Premium', 'Croissant Butter', 'Kue Cokelat', 'Pain au Chocolat', 'Lapis Surabaya', 'Roti Kayu Manis'].map((t, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <AnimatedSection className="features-grid">
          <>
            {[
              { icon: 'M12 2a9 9 0 110 18A9 9 0 0112 2zm0 4a1 1 0 100 2 1 1 0 000-2zm0 4a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z', title: 'Bahan Alami', desc: 'Tepung pilihan dan bahan segar tanpa pengawet', color: '#f97316' },
              { icon: 'M17 8C8 10 5.9 16.17 3.82 19H2l2 3 2-3h-1.17C7.7 16.5 9.5 13 17 11V8zm2-5l-4 2 4 2 4-2-4-2zM5 8v7l4 4 4-4V8H5zm2 2h4v4.17L9 16.34l-2-2V10z', title: 'Dipanggang Segar', desc: 'Langsung dari oven setiap pagi pukul 05.00', color: '#ef4444' },
              { icon: 'M19 10c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7 7 3.13 7 7zm2 0c0-4.97-4.03-9-9-9s-9 4.03-9 9c0 2.96 1.43 5.59 3.64 7.24L4.5 21h15l-3.14-3.76C18.57 15.59 21 12.96 21 10zM11 14v-3H8v-2h3V6h2v3h3v2h-3v3h-2z', title: 'Antar ke Rumah', desc: 'Layanan pengiriman cepat di area kota', color: '#8b5cf6' },
              { icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z', title: 'Dibuat dengan Cinta', desc: 'Resep turun-temurun dengan sentuhan modern', color: '#ec4899' },
            ].map(f => (
              <div key={f.title} className="feat-card" style={{ '--feat-color': f.color } as React.CSSProperties}>
                <div className="feat-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d={f.icon} /></svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </>
        </AnimatedSection>
      </section>

      {/* ── MENU ── */}
      <section id="menu" className="menu-section">
        <AnimatedSection>
          <div className="section-head">
            <span className="sec-eye">Menu Kami</span>
            <h2 className="sec-title">Pilihan Produk <span>Unggulan</span></h2>
            <p className="sec-sub">Setiap produk dibuat dengan keahlian dan bahan terpilih</p>
          </div>
        </AnimatedSection>

        <div className="menu-grid">
          {menuItems.map((item, i) => (
            <AnimatedSection key={item.id} className="menu-card-wrap" >
              <div className="menu-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="card-img-wrap">
                  <img src={item.img} alt={item.name} className="card-img" loading="lazy" />
                  <div className="card-img-overlay" />
                  <span className="card-tag" style={{ background: item.tagColor }}>{item.tag}</span>
                </div>
                <div className="card-body">
                  <h3 className="card-name">{item.name}</h3>
                  <p className="card-desc">{item.desc}</p>
                  <div className="card-foot">
                    <span className="card-price">{item.price}</span>
                    {getItemQty(item.id) > 0 ? (
                      <div className="card-qty-control">
                        <button onClick={() => decreaseQty(item.id)} className="qty-btn" type="button">−</button>
                        <span className="qty-val">{getItemQty(item.id)}</span>
                        <button onClick={() => increaseQty(item.id)} className="qty-btn" type="button">+</button>
                      </div>
                    ) : (
                      <button
                        className="card-btn"
                        onClick={() => addToCart(item)}
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '4px' }}>
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Tambah
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <AnimatedSection>
        <section className="cta-section">
          <div className="cta-blob cta-blob-1" />
          <div className="cta-blob cta-blob-2" />
          <div className="cta-inner">
            <span className="sec-eye" style={{ color: '#fcd34d' }}>Layanan Spesial</span>
            <h2>Pesan Kue untuk<br />Acara Spesial Anda?</h2>
            <p>Kami menerima pesanan kue ulang tahun, pernikahan, dan hampers. Hubungi kami sekarang!</p>
            <button className="btn-white" onClick={() => scrollTo('kontak')} type="button">
              Hubungi Kami
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        </section>
      </AnimatedSection>

      {/* ── TENTANG ── */}
      <section id="tentang" className="about-section">
        <AnimatedSection className="about-inner">
          <>
            <div className="about-visual">
              <div className="about-img-frame">
                {imgError ? (
                  <div className="about-img-fallback">
                    <div className="fallback-content">
                      <span style={{fontSize:'4rem', display:'block', marginBottom:'1rem'}}>SB</span>
                      <p>Shofi Bakery</p>
                      <p style={{fontSize:'.9rem',opacity:.7}}>Freshly Baked Every Day</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src="/hero.webp"
                    alt="Dapur Shofi Bakery"
                    className="about-img"
                    onError={() => setImgError(true)}
                  />
                )}
                <div className="about-frame-deco" />
              </div>
              <div className="about-card-badge">
                <span className="badge-num">6+</span>
                <span className="badge-txt">Tahun Berpengalaman</span>
              </div>
              <div className="about-card-rating">
                <div className="rating-stars">
                  {[1,2,3,4,5].map(s => <span key={s} className="star-fill">&#9733;</span>)}
                </div>
                <span>4.9 / 5.0 Rating</span>
              </div>
            </div>

            <div className="about-content">
              <span className="sec-eye">Tentang Kami</span>
              <h2 className="about-title">Kisah di Balik<br /><span>Setiap Gigitan</span></h2>
              <p>Shofi Bakery lahir dari dapur kecil dengan mimpi besar — menyajikan roti artisan berkualitas tinggi yang bisa dinikmati semua orang. Dipimpin oleh Chef Shofi yang telah berpengalaman lebih dari 10 tahun di industri pastry.</p>
              <p>Kami percaya bahwa makanan yang baik dimulai dari bahan yang baik. Itulah mengapa kami hanya menggunakan tepung premium, butter asli, dan susu segar tanpa campuran apapun.</p>
              <div className="about-features">
                {['Sertifikat BPOM', 'Halal MUI', 'Rating 4.9 / 5.0', 'Pengiriman Cepat'].map(f => (
                  <div key={f} className="about-feat">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </>
        </AnimatedSection>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="testi-section">
        <AnimatedSection>
          <div className="section-head">
            <span className="sec-eye">Testimoni</span>
            <h2 className="sec-title">Kata <span>Pelanggan</span> Kami</h2>
          </div>
        </AnimatedSection>
        <AnimatedSection className="testi-grid">
          <>
            {[
              { name: 'Rina Dewi', role: 'Pelanggan Tetap', text: 'Croissant-nya juara! Renyah banget dan tidak terlalu manis. Tiap minggu pasti beli!', rating: 5 },
              { name: 'Budi Santoso', role: 'Pemesan Kue', text: 'Kue ulang tahun anakku dari Shofi Bakery hasilnya cantik dan rasanya enak sekali.', rating: 5 },
              { name: 'Sari Amelia', role: 'Pelanggan Setia', text: 'Roti tawarnya lembut dan tahan lama. Jadi langganan keluarga kami sekarang.', rating: 5 },
            ].map((t, i) => (
              <div key={i} className="testi-card">
                <div className="testi-quote">&ldquo;</div>
                <p className="testi-text">{t.text}</p>
                <div className="testi-stars">{Array.from({ length: t.rating }).map((_, j) => <span key={j} className="star-fill">&#9733;</span>)}</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.name[0]}</div>
                  <div>
                    <b>{t.name}</b>
                    <span>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        </AnimatedSection>
      </section>

      {/* ── KONTAK ── */}
      <section id="kontak" className="contact-section">
        <AnimatedSection>
          <div className="section-head">
            <span className="sec-eye">Kontak</span>
            <h2 className="sec-title">Hubungi <span>Kami</span></h2>
          </div>
        </AnimatedSection>
        <AnimatedSection className="contact-grid">
          <>
            <div className="contact-info">
              {[
                { label: 'Alamat', val: 'Jl. Raya Bakery No. 12, Kota Anda', path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z' },
                { label: 'WhatsApp', val: '0812-3456-7890', path: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z' },
                { label: 'Jam Buka', val: 'Senin - Sabtu: 06.00 - 20.00 | Minggu: 07.00 - 17.00', path: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z' },
                { label: 'Instagram', val: '@shofibakery', path: 'M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 011.25 1.25A1.25 1.25 0 0117.25 8 1.25 1.25 0 0116 6.75a1.25 1.25 0 011.25-1.25M12 7a5 5 0 015 5 5 5 0 01-5 5 5 5 0 01-5-5 5 5 0 015-5m0 2a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3z' },
              ].map(c => (
                <div key={c.label} className="ci-row">
                  <div className="ci-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><path d={c.path} /></svg>
                  </div>
                  <div>
                    <b>{c.label}</b>
                    <p>{c.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <form className="contact-form" onSubmit={e => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const nama = (form.querySelector('#nama') as HTMLInputElement)?.value
              const pesan = (form.querySelector('#pesan') as HTMLTextAreaElement)?.value
              const msg = encodeURIComponent(`Halo Shofi Bakery!\n\nNama: *${nama}*\nPesan: ${pesan}`)
              window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank')
            }}>
              <h3>Kirim Pesan</h3>
              <div className="form-group">
                <label htmlFor="nama">Nama Anda</label>
                <input id="nama" type="text" placeholder="Masukkan nama Anda" required />
              </div>
              <div className="form-group">
                <label htmlFor="wa">No. WhatsApp</label>
                <input id="wa" type="tel" placeholder="08xx-xxxx-xxxx" required />
              </div>
              <div className="form-group">
                <label htmlFor="pesan">Pesan</label>
                <textarea id="pesan" placeholder="Tulis pesan atau pertanyaan Anda..." rows={4} required />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Kirim Pesan
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </form>
          </>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="brand-logo">SB</span>
            <span className="brand-name">Shofi Bakery</span>
            <p>Freshly baked with love, every single day.</p>
          </div>
          <div className="footer-col">
            <h4>Menu Pilihan</h4>
            <ul>{['Roti Tawar', 'Croissant', 'Kue Ulang Tahun', 'Hampers'].map(m => <li key={m}><button onClick={() => scrollTo('menu')}>{m}</button></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>Informasi</h4>
            <ul>{['Tentang Kami', 'Cara Pemesanan', 'Syarat & Ketentuan', 'Kebijakan Privasi'].map(m => <li key={m}><button>{m}</button></li>)}</ul>
          </div>
        </div>
        <div className="footer-bar">
          <p>2024 Shofi Bakery. All rights reserved.</p>
        </div>
      </footer>

      {/* ── FLOATING CART BUTTON ── */}
      {totalItems > 0 && (
        <button
          className="floating-cart-btn"
          onClick={() => setIsCartOpen(true)}
          aria-label="Buka Keranjang"
          type="button"
        >
          <div className="cart-btn-inner">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span className="cart-badge">{totalItems}</span>
          </div>
        </button>
      )}

      {/* ── CART SIDEBAR DRAWER ── */}
      <div className={`cart-drawer-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)} />
      
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="cart-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--amber)' }}>
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <h2>Keranjang</h2>
            <span className="cart-header-count">{totalItems} Varian</span>
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Tutup Keranjang" type="button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty-state">
              <div className="empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h3>Keranjang belanja Anda kosong</h3>
              <p>Tambahkan roti dan kue lezat kami ke keranjang untuk mulai melakukan pemesanan.</p>
              <button className="btn-primary" onClick={() => { setIsCartOpen(false); scrollTo('menu'); }} type="button" style={{ marginTop: '1rem' }}>
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {cart.map(item => {
                const itemSubtotal = parsePrice(item.price) * item.quantity
                return (
                  <div key={item.id} className="cart-item-card">
                    <img src={item.img} alt={item.name} className="cart-item-img" />
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <div className="cart-item-price-row">
                        <span className="cart-item-price-unit">{item.price}</span>
                        <span className="cart-item-price-sub">{formatPrice(itemSubtotal)}</span>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-qty-selector">
                          <button onClick={() => decreaseQty(item.id)} className="cart-qty-btn" type="button">−</button>
                          <span className="cart-qty-val">{item.quantity}</span>
                          <button onClick={() => increaseQty(item.id)} className="cart-qty-btn" type="button">+</button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="cart-remove-btn" aria-label="Hapus produk" type="button">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-summary-row">
              <span>Total Pemesanan:</span>
              <span className="cart-summary-total">{formatPrice(totalPrice)}</span>
            </div>
            
            <form className="cart-checkout-form" onSubmit={handleCartOrder}>
              <div className="form-group-sm">
                <label htmlFor="cart-nama">Nama Penerima</label>
                <input
                  id="cart-nama"
                  type="text"
                  placeholder="Masukkan nama lengkap Anda"
                  value={custName}
                  onChange={e => setCustName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group-sm">
                <label htmlFor="cart-alamat">Alamat Lengkap Pengiriman</label>
                <textarea
                  id="cart-alamat"
                  placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan/kecamatan"
                  value={custAddress}
                  onChange={e => setCustAddress(e.target.value)}
                  rows={2}
                  required
                />
              </div>
              <div className="form-group-sm" style={{ marginBottom: '0.8rem' }}>
                <label htmlFor="cart-catatan">Catatan Pesanan (Opsional)</label>
                <input
                  id="cart-catatan"
                  type="text"
                  placeholder="Contoh: jangan dipotong, tambah ucapan..."
                  value={custNotes}
                  onChange={e => setCustNotes(e.target.value)}
                />
              </div>
              <button type="submit" className="cart-checkout-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.5 2C6.253 2 2 6.253 2 11.5c0 1.938.57 3.744 1.55 5.253L2 22l5.356-1.534A9.46 9.46 0 0011.5 21C16.747 21 21 16.747 21 11.5S16.747 2 11.5 2zm0 17c-1.66 0-3.207-.497-4.497-1.35l-.323-.202-3.179.91.924-3.096-.22-.342A7.473 7.473 0 014 11.5C4 7.364 7.364 4 11.5 4S19 7.364 19 11.5 15.636 19 11.5 19z"/></svg>
                Kirim Pesanan via WA
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  )
}
