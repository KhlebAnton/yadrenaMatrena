document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('.header');

    window.addEventListener('scroll', function () {
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

    carousel.addEventListener('touchstart', function (e) {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    carousel.addEventListener('mousedown', function (e) {
        isDragging = true;
        touchStartX = e.clientX;
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        touchEndX = e.clientX;
    });

    document.addEventListener('mouseup', function (e) {
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

    document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
            goPrev();
        } else if (e.key === 'ArrowRight') {
            goNext();
        }
    });

    updateSlides();
    autoScrollInterval = setInterval(goNext, 3000);

    carousel.addEventListener('mouseenter', function () {
        clearInterval(autoScrollInterval);
    });

    carousel.addEventListener('mouseleave', function () {
        resetAutoScroll();
    });

    const images = document.querySelectorAll('.hero-slide img');
    images.forEach(img => {
        img.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });
    });

    const productOrderInfo = {
        img: './images/products/2.png',
        collection: 'Коллекция',
        model: 'Модель',
        color: '#000000',
        station: 'Станция',
    }


    // Инициализация всех модальных окон
    const modals = document.querySelectorAll('.modal-overlay');

    modals.forEach(modal => {
        // modal.classList.remove('is-open');

        const modalId = modal.dataset.modal;
        const closeBtn = modal.querySelector('.modal-close');
        const openBtn = document.querySelectorAll(`[data-btn="${modalId}"]`);

        function openModal(name = null) {
            modals.forEach(modal => {
                modal.classList.remove('is-open');
                document.body.style.overflow = '';


                modal.querySelectorAll('video').forEach(video => {
                    video.pause();
                    video.currentTime = 0;
                    const btn = video.closest('.swiper-slide').querySelector('.video_btn');
                    if (btn) btn.style.display = '';
                });
            })
            modal.classList.add('is-open');
            document.body.style.overflow = 'hidden';
            if (modalId === 'product') {
                modal.querySelector('.product_model-name').textContent = name ? name : 'Без имени';

            };

            if (modalId === 'productOrder') {

                document.getElementById('orderImg').src = productOrderInfo.img;
                document.getElementById('orderCollection').textContent = productOrderInfo.collection;
                document.getElementById('orderModel').textContent = productOrderInfo.model;

            }
        }

        function closeModal() {
            modal.classList.remove('is-open');
            document.body.style.overflow = '';


            modal.querySelectorAll('video').forEach(video => {
                video.pause();
                video.currentTime = 0;
                const btn = video.closest('.swiper-slide').querySelector('.video_btn');
                if (btn) btn.style.display = '';
            });
        }



        if (openBtn) {
            openBtn.forEach(btn => {
                btn.addEventListener('click', () => {
                    if (btn.getAttribute('data-btn') === 'product') {
                        let nameProduct = btn.getAttribute('data-product-model');
                        console.log(nameProduct);
                        openModal(nameProduct);

                        productOrderInfo.img = btn.querySelector('.product-card_img').src;
                        productOrderInfo.collection = btn.getAttribute('data-product-collection');
                        productOrderInfo.model = btn.getAttribute('data-product-model');


                    } else if (btn.getAttribute('data-btn') === 'productOrder') {
                        console.log('order');
                        document.querySelectorAll('.model_color-item').forEach(color => {
                            if (color.classList.contains('is-active')) {
                                productOrderInfo.color = color.style.background;
                            }

                            document.getElementById('orderColor').style.background = productOrderInfo.color;
                        });
                        document.querySelectorAll('.model-station-tab').forEach(station => {
                            if (station.classList.contains('is-active')) {
                                productOrderInfo.station = station.getAttribute('data-tab-station').replace("Станция ", "");
                            }

                            document.getElementById('orderStation').textContent = productOrderInfo.station;
                        })
                        openModal();

                    } else {
                        openModal()
                    }



                })


            });
        }
        if (closeBtn) closeBtn.addEventListener('click', closeModal);

        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });

        if (modalId === 'menu') {
            modal.addEventListener('click', () => {
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



    // карточки 
    const tabItems = document.querySelectorAll('.product-content_tab-item');
    const allSlides = document.querySelectorAll('.product-card', '.swiper-slide');

    const swiper = new Swiper('.product-content_swiper', {
        slidesPerView: 'auto',
        spaceBetween: 10,

    });

    const defaultTab = document.querySelector('.product-content_tab-item.is-active');
    if (defaultTab) {
        const defaultCollection = defaultTab.dataset.tabCollection;
        filterSlidesByCollection(defaultCollection);
    }

    tabItems.forEach(tab => {
        tab.addEventListener('click', function () {
            const collectionName = this.dataset.tabCollection;

            tabItems.forEach(item => item.classList.remove('is-active'));

            this.classList.add('is-active');

            filterSlidesByCollection(collectionName);
        });
    });

    function filterSlidesByCollection(collectionName) {
        allSlides.forEach(slide => {
            slide.style.display = 'none';
        });

        const collectionSlides = document.querySelectorAll(`.swiper-slide[data-product-collection="${collectionName}"]`);
        collectionSlides.forEach(slide => {
            slide.style.display = 'flex';
        });

        setTimeout(() => {
            swiper.update();
        }, 100);
    }

    window.addEventListener('resize', function () {
        swiper.update();
    });




    const phoneInputs = document.querySelectorAll('.phone-input');
    if (phoneInputs.length) {
        phoneInputs.forEach(input => {
            var iti = window.intlTelInput(input, {
                nationalMode: true,
                initialCountry: 'auto',
                geoIpLookup: function (callback) {
                    jQuery.get('https://ipinfo.io', function () { }, 'jsonp').always(function (resp) {
                        var countryCode = resp && resp.country ? resp.country : 'us';
                        callback(countryCode);
                    });
                },
                utilsScript: './scripts/utils.js',
                preferredCountries: ['ru']
            });
            var handleChange = function () {
                var text = iti.isValidNumber() ? iti.getNumber() : '';
                iti.setNumber(text);
                input.value = text;
            };
            input.addEventListener('mouseleave', handleChange);
            input.addEventListener('change', handleChange);
        });
    }


 document.querySelectorAll('.form').forEach(form => {
    form.addEventListener('submit', (e)=> {
        e.preventDefault();

        form.querySelector('.form-wrapper').style.display = 'none';
        form,this.querySelector('.succes_form-msg').style.display = 'flex';
    })
 });

 const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
       
        
        item.addEventListener('click', function() {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('is-open');
                }
            });
            
            item.classList.toggle('is-open');
        });
    });


});