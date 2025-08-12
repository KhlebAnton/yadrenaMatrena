document.addEventListener('DOMContentLoaded', function() {
     const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 100) {
            header.classList.add('is-visible');
        } else {
            header.classList.remove('is-visible');
        }
    });
    // hero carusel
    const slides = document.querySelectorAll('.hero-slide');
    const carousel = document.querySelector('.hero-carousel');
    let currentIndex = 2;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    let autoScrollInterval;
    const SWIPE_THRESHOLD = 50;

    function updateSlides() {
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev', 'next', 'far-prev', 'far-next');
            
            if (index === currentIndex) {
                slide.classList.add('active');
            } else if (index === currentIndex - 1 || (currentIndex === 0 && index === slides.length - 1)) {
                slide.classList.add('prev');
            } else if (index === currentIndex + 1 || (currentIndex === slides.length - 1 && index === 0)) {
                slide.classList.add('next');
            } else if (index === currentIndex - 2 || 
                      (currentIndex === 0 && index === slides.length - 2) ||
                      (currentIndex === 1 && index === slides.length - 1)) {
                slide.classList.add('far-prev');
            } else if (index === currentIndex + 2 || 
                      (currentIndex === slides.length - 1 && index === 1) ||
                      (currentIndex === slides.length - 2 && index === 0)) {
                slide.classList.add('far-next');
            }
        });
    }

    function goNext() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlides();
        resetAutoScroll();
    }

    function goPrev() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlides();
        resetAutoScroll();
    }

    function resetAutoScroll() {
        clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(goNext, 3000);
    }

    carousel.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    carousel.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});

    carousel.addEventListener('mousedown', function(e) {
        isDragging = true;
        touchStartX = e.clientX;
        e.preventDefault(); 
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        touchEndX = e.clientX;
    });

    document.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        handleSwipe();
    });

    function handleSwipe() {
        if (Math.abs(touchEndX - touchStartX) < SWIPE_THRESHOLD) return;

        if (touchEndX < touchStartX) {
            goNext();
        } else {
            goPrev();
        }
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            goPrev();
        } else if (e.key === 'ArrowRight') {
            goNext();
        }
    });

    updateSlides();
    autoScrollInterval = setInterval(goNext, 3000);

    carousel.addEventListener('mouseenter', function() {
        clearInterval(autoScrollInterval);
    });

    carousel.addEventListener('mouseleave', function() {
        resetAutoScroll();
    });

    const images = document.querySelectorAll('.hero-slide img');
    images.forEach(img => {
        img.addEventListener('dragstart', function(e) {
            e.preventDefault();
        });
    });



    // Инициализация всех модальных окон
  const modals = document.querySelectorAll('.modal-overlay');
  
  modals.forEach(modal => {
    modal.classList.remove('is-open');
    
    const modalId = modal.dataset.modal;
    const closeBtn = modal.querySelector('.modal-close');
    const openBtn = document.querySelector(`[data-btn="${modalId}"]`);
    
    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
       modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }
    
    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
      if (e.target === modal) closeModal();
    });

    if(modalId === 'menu') {
        modal.addEventListener('click', ()=> {
            closeModal();
        })
    }
  });
  
 

//   анимации
    const animatedElements = document.querySelectorAll('[data-animation]');
    
    function isElementInViewport(el, offset = 100) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) - offset &&
            rect.bottom >= 0
        );
    }
    
    function handleAnimation() {
        animatedElements.forEach(el => {
            if (isElementInViewport(el)) {
                const animationType = el.getAttribute('data-animation');
                
                if (animationType === 'right') {
                    el.style.transition = 'transform 1s ease-out';
                    el.style.transform = 'translateX(0)';
                } else if (animationType === 'opacity_top') {
                    el.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }
                
                el.removeAttribute('data-animation');
            }
        });
    }
    
    animatedElements.forEach(el => {
        const animationType = el.getAttribute('data-animation');
        if (animationType === 'right') {
            el.style.transform = 'translateX(200px)';
        } else if (animationType === 'opacity_top') {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
        }
    });
    
    window.addEventListener('load', handleAnimation);
    window.addEventListener('scroll', handleAnimation);
    
    handleAnimation();
});