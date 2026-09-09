document.addEventListener('DOMContentLoaded', () => {
  // 1. Inicializar Lenis para Scroll Suave (ScrollSmoother)
  let lenis;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  // 1.1 Anclas (#hash) compatibles con Lenis: tanto los links dentro de la misma
  // página (#servicios) como los que llegan desde otra página (index.html#servicios)
  if (lenis) {
    const NAV_OFFSET = 90; // alto aproximado del navbar fijo

    function currentPageFile() {
      const seg = window.location.pathname.split('/').pop();
      return seg || 'index.html';
    }

    function scrollToHash(hash, immediate) {
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      lenis.resize();
      lenis.scrollTo(target, { offset: -NAV_OFFSET, immediate: !!immediate });
    }

    // Si la página carga con un #hash en la URL (ej: llegando desde otra página)
    if (window.location.hash) {
      requestAnimationFrame(() => {
        setTimeout(() => scrollToHash(window.location.hash, true), 150);
      });
    }

    // Clic en cualquier link con #hash que apunte a esta misma página
    document.querySelectorAll('a[href*="#"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const hashIndex = href.indexOf('#');
      const path = href.slice(0, hashIndex);
      const hash = href.slice(hashIndex);
      if (hash.length <= 1) return;

      const linkPage = path || currentPageFile();
      if (linkPage !== currentPageFile()) return; // apunta a otra página: navegación normal

      link.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToHash(hash, false);
        if (history.pushState) history.pushState(null, '', hash);
      });
    });
  }

  // 2. Registrar GSAP y conectar con ScrollTrigger & Lenis
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    }

    // 3. Animación de H2: SplitText por carácter, ScrollTrigger con scrub desde color gris
    if (typeof SplitText !== 'undefined') {
      gsap.registerPlugin(SplitText);
      const h2Elements = document.querySelectorAll('h2');
      h2Elements.forEach((h2) => {
        const split = new SplitText(h2, { type: 'chars, words' });
        gsap.from(split.chars, {
          color: '#a3c9e9',
          opacity: 1,
          stagger: 0.03,
          ease: 'none',
          duration:0.0001,
          scrollTrigger: {
            trigger: h2,
            start: 'top bottom',
            end: 'top center',
            scrub: true
          }
        });
      });
    }

    // 4. Animación del Header Sincronizada (Home / Nosotros):
    if (document.querySelector('.car-carousel')) {
      const headerTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Estado inicial: Círculo Autocool permanece invisible hasta que comience su ascenso
      gsap.set('.title-marca', { autoAlpha: 0 });

      headerTl.from('.welcome-box', { y: -25,  duration: 0.8, delay: 0.1 })
  
              .from('.car-carousel', {
                height: 0,
                duration: 1.2,
                ease: 'power3.inOut'
              }, '<').from(".hero-content", { height: 0, duration: 0.8 }, '<')
              .set('.title-marca', { autoAlpha: 1 }, '-=0.6')
              .from('.title-marca', {
                y: window.innerWidth <= 576 ? 55 : (window.innerWidth <= 768 ? 85 : 180),
                duration: 1.2,
                ease: 'power3.out'
              }, '<')
              .from('.hero-title', { y: 20, opacity: 0, duration: 0.7 }, '-=0.9')
              .from('.cta .btn-autocool', {
                clipPath: 'inset(0 100% 0 0)',
                duration: 1.0,
                stagger: 0.1,
                ease: 'power3.inOut'
              }, '-=0.9');
    } else if (document.querySelector('.nosotros-hero')) {
      const nosotrosTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      nosotrosTl.from('.nosotros-hero-circle-bg', { scale: 0.4, opacity: 0, duration: 1.3, ease: 'power3.out' })
                .from('.welcome-box', { y: -30, opacity: 0, duration: 0.8 }, '-=1.0')
                .from('.title-marca', { y: 40, opacity: 0, duration: 1.0 }, '-=0.6')
                .from('.nosotros-hero .hero-title', { y: 30, opacity: 0, duration: 0.8 }, '-=0.7')
                .from('.nosotros-hero .perf-section-subtitle', { y: 20, opacity: 0, duration: 0.7 }, '-=0.6')
                .from('.nosotros-hero .cta .btn-autocool', {
                  clipPath: 'inset(0 100% 0 0)',
                  duration: 0.9,
                  ease: 'power3.inOut'
                }, '-=0.5');
    } else if (document.querySelector('.service-header-compact')) {
      const serviceTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      serviceTl.from('.service-header-compact .welcome-box', { y: -20, opacity: 0, duration: 0.7, delay: 0.1 })
               .from('.service-title-compact', { y: 25, opacity: 0, duration: 0.8 }, '-=0.4')
               .from('.service-header-compact .perf-section-subtitle', { y: 15, opacity: 0, duration: 0.7 }, '-=0.5')
               .from('.service-header-compact .cta .btn-autocool', {
                 clipPath: 'inset(0 100% 0 0)',
                 duration: 0.8,
                 ease: 'power3.inOut'
               }, '-=0.4');
    } else if (document.querySelector('.blog-hero-section')) {
      const blogHeroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      blogHeroTl.from('.blog-breadcrumb', { y: -15, opacity: 0, duration: 0.6, delay: 0.1 })
                .from('.blog-hero-section .badge', { y: 15, opacity: 0, duration: 0.6 }, '-=0.3')
                .from('.blog-hero-section h1', { y: 25, opacity: 0, duration: 0.8 }, '-=0.4')
                .from('.blog-hero-section .lead', { y: 15, opacity: 0, duration: 0.7 }, '-=0.5')
                .from('.blog-single-meta-bar', { y: 15, opacity: 0, duration: 0.6 }, '-=0.4');
    }

    // 5. Cards de servicios, equipo y diferenciadores (.site-card): Animación desde scale 0.85 con ScrollTrigger
    const perfCards = document.querySelectorAll('.site-card');
    if (perfCards.length > 0) {
      perfCards.forEach((card) => {
        gsap.from(card, {
          scale: 0.9,
          opacity: 0,
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse'
          }
        });
      });
    }

    // 6. Animaciones adicionales para la página Nosotros (Manifiesto & Stats)
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length > 0) {
      gsap.from(statCards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.stat-card',
          start: 'top 85%'
        }
      });
    }

    const manifestoBox = document.querySelector('.manifesto-box');
    if (manifestoBox) {
      gsap.from(manifestoBox, {
        x: -40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: manifestoBox,
          start: 'top 85%'
        }
      });
    }
  }


  // --- Lógica del carrusel de autos ---
  const carousel = document.querySelector('.car-carousel');
  const heading = carousel ? carousel.closest('h1') : null;
  const slides = document.querySelectorAll('.car-slide');
  let currentIndex = 0;
  const slideDuration = 4000;

  if (heading) {
    heading.className = 'text-center slide-1-active';
  }

  function nextSlide() {
    if (!slides.length) return;
    slides[currentIndex].classList.remove('active');
    currentIndex = (currentIndex + 1) % slides.length;
    const nextSlideElement = slides[currentIndex];
    nextSlideElement.classList.add('active');
    
    if (heading) {
      heading.className = `text-center slide-${currentIndex + 1}-active`;
    }
  }

  if (slides.length > 0) {
    setInterval(nextSlide, slideDuration);
  }

  // 7. Formulario de Contacto -> Redirección a WhatsApp con mensaje predeterminado
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombreInput = document.getElementById('nombreContacto');
      const modeloInput = document.getElementById('modeloContacto');
      const servicioSelect = document.getElementById('servicioContacto');
      const mensajeInput = document.getElementById('mensajeContacto');

      const nombre = nombreInput ? nombreInput.value.trim() : '';
      const modelo = modeloInput ? modeloInput.value.trim() : '';
      const servicio = servicioSelect && servicioSelect.selectedIndex >= 0 ? servicioSelect.options[servicioSelect.selectedIndex].text : '';
      const mensaje = mensajeInput ? mensajeInput.value.trim() : '';

      let texto = `¡Hola Círculo Autocool! Quisiera realizar una consulta desde el sitio web:\n\n`;
      texto += `*Nombre:* ${nombre}\n`;
      texto += `*Modelo de Auto:* ${modelo}\n`;
      texto += `*Servicio Requerido:* ${servicio}\n`;
      if (mensaje) {
        texto += `📝 *Detalle Adicional:* ${mensaje}\n`;
      }


      const whatsappNum = '56961570767';
      const whatsappUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(texto)}`;

      window.open(whatsappUrl, '_blank');
    });
  }

  // 8. Lógica de Filtrado y Búsqueda en blog.html
  const blogSearchInput = document.getElementById('blogSearchInput');
  const categoryPills = document.querySelectorAll('.category-pill');
  const blogCards = document.querySelectorAll('.blog-card-col');

  if (blogSearchInput || categoryPills.length > 0) {
    let currentCategory = 'all';
    let searchQuery = '';

    function filterBlogPosts() {
      blogCards.forEach(col => {
        const card = col.querySelector('.blog-card');
        if (!card) return;

        const cardCategory = card.getAttribute('data-category') || '';
        const titleText = (card.querySelector('.blog-card-title')?.textContent || '').toLowerCase();
        const excerptText = (card.querySelector('.blog-card-excerpt')?.textContent || '').toLowerCase();
        const categoryText = (card.querySelector('.blog-card-category')?.textContent || '').toLowerCase();

        const matchesCategory = (currentCategory === 'all' || cardCategory === currentCategory);
        const matchesSearch = searchQuery === '' || 
                              titleText.includes(searchQuery) || 
                              excerptText.includes(searchQuery) || 
                              categoryText.includes(searchQuery);

        if (matchesCategory && matchesSearch) {
          col.style.display = 'block';
        } else {
          col.style.display = 'none';
        }
      });
    }

    if (blogSearchInput) {
      blogSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        filterBlogPosts();
      });
    }

    categoryPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category') || 'all';
        filterBlogPosts();
      });
    });
  }

  // 9. Lógica de Tabla de Contenidos & Feedback en blog-single.html
  const tocLinks = document.querySelectorAll('.blog-toc-list a');
  if (tocLinks.length > 0) {
    const sections = Array.from(tocLinks).map(link => {
      const targetId = link.getAttribute('href').replace('#', '');
      return document.getElementById(targetId);
    }).filter(Boolean);

    window.addEventListener('scroll', () => {
      let scrollPos = window.scrollY + 120;
      sections.forEach((sec, idx) => {
        if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
          tocLinks.forEach(l => l.classList.remove('active'));
          tocLinks[idx]?.classList.add('active');
        }
      });
    });
  }

});




