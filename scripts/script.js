document.addEventListener('DOMContentLoaded', function () {
    // Видео: воспроизведение/пауза по клику на кнопку или область
    document.querySelectorAll('.video_wrapper').forEach(wrapper => {
        const video = wrapper.querySelector('video');
        const btn = wrapper.querySelector('.video_btn');
        if (!video || !btn) return;

        function showBtn() {
            btn.style.display = '';
            wrapper.classList.remove('is-playing');
        }
        function hideBtn() {
            btn.style.display = 'none';
            wrapper.classList.add('is-playing');
        }

        video.addEventListener('play', hideBtn);
        video.addEventListener('pause', showBtn);

        function togglePlay() {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        }

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePlay();
        });
        wrapper.addEventListener('click', () => togglePlay());
    });

    const header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 100) {
                header.classList.add('is-visible');
            } else {
                header.classList.remove('is-visible');
            }
        });
    }
    
    // hero carusel
    const slides = document.querySelectorAll('.hero-slide');
    const carousel = document.querySelector('.hero-carousel');
    
    if (carousel && slides.length > 0) {
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

        function handleSwipe() {
            if (Math.abs(touchEndX - touchStartX) < SWIPE_THRESHOLD) return;

            if (touchEndX < touchStartX) {
                goNext();
            } else {
                goPrev();
            }
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
    }

  


    // Инициализация всех модальных окон
    const modals = document.querySelectorAll('.modal-overlay');

    modals.forEach(modal => {
       

       

        const modalId = modal.dataset.modal;
        const closeBtn = modal.querySelector('.modal-close');
        const openBtn = document.querySelectorAll(`[data-btn="${modalId}"]`);

        function openModal(name = null, triggerEl = null) {
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

            // Попап «Подробнее» (rich): подставляем массив фото из data-img кнопки
            if (modalId === 'rich' && triggerEl && triggerEl.dataset.img) {
                const container = modal.querySelector('.rich_content');
                if (container) {
                    try {
                        const urls = JSON.parse(triggerEl.dataset.img);
                        if (Array.isArray(urls) && urls.length) {
                            container.innerHTML = urls.map(url => `<img src="${url}" alt="">`).join('');
                        }
                    } catch (err) {
                        console.warn('rich modal: неверный data-img', triggerEl.dataset.img, err);
                    }
                }
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
                btn.addEventListener('click', (e) => {
                    openModal(null, e.currentTarget);
                });
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

        // Обработка модалки выбора ПВЗ с картой
        if (modalId === 'delivery_pvz') {
            let map = null;
            let mapMobile = null;
            let markerCluster = null;
            let markerClusterMobile = null;
            let mapInitialized = false;

            // Массив точек ПВЗ (пример данных)
            const pvzPoints = [
                { lat: 55.7558, lng: 37.6173, name: 'ПВЗ 1', address: '16-я линия, 61/24', cost: 'бесплатно', date: '5 февраля' },
                { lat: 55.7500, lng: 37.6200, name: 'ПВЗ 2', address: 'Невский проспект, 28', cost: 'бесплатно', date: '6 февраля' },
                { lat: 55.7600, lng: 37.6100, name: 'ПВЗ 3', address: 'Садовая ул., 12', cost: 'бесплатно', date: '5 февраля' },
                { lat: 55.7450, lng: 37.6250, name: 'ПВЗ 4', address: 'Лиговский пр., 50', cost: '100 ₽', date: '5 февраля' },
                { lat: 55.7650, lng: 37.6050, name: 'ПВЗ 5', address: 'Владимирский пр., 15', cost: 'бесплатно', date: '7 февраля' },
                { lat: 55.7555, lng: 37.6175, name: 'ПВЗ 6', address: 'Гороховая ул., 33', cost: 'бесплатно', date: '6 февраля' },
                { lat: 55.7559, lng: 37.6174, name: 'ПВЗ 7', address: 'Литейный пр., 22', cost: 'бесплатно', date: '5 февраля' },
            ];

            let selectedMarker = null;
            let selectedPvzIndex = null;
            let markers = []; // Массив для хранения маркеров
            let currentSearchQuery = ''; // Текущий поисковый запрос

            // Создание кастомных иконок маркеров
            function createMarkerIcon(isSelected = false) {
                const className = isSelected ? 'custom-single-marker is-selected' : 'custom-single-marker';
                
                // Создаем круглый маркер
                const markerHtml = `<div class="${className}"></div>`;
                
                return L.divIcon({
                    html: markerHtml,
                    className: 'custom-marker-icon',
                    iconSize: [40, 52],
                    iconAnchor: [20, 52],
                    popupAnchor: [0, -52]
                });
            }

            // Функция генерации списка ПВЗ
            function renderPvzList(searchQuery = '') {
                const pvzContainer = modal.querySelector('.pvz_location__container');
                if (!pvzContainer) return;

                pvzContainer.innerHTML = '';

                const query = searchQuery.toLowerCase().trim();
                let visibleCount = 0;

                pvzPoints.forEach((point, index) => {
                    // Фильтрация по поисковому запросу
                    if (query) {
                        const matchesName = point.name.toLowerCase().includes(query);
                        const matchesAddress = point.address.toLowerCase().includes(query);
                        if (!matchesName && !matchesAddress) {
                            return; // Пропускаем элемент, если не соответствует поиску
                        }
                    }

                    visibleCount++;

                    const isActive = selectedPvzIndex === index;
                    const pvzItem = document.createElement('div');
                    pvzItem.className = `pvz_location__item${isActive ? ' is-active' : ''}`;
                    pvzItem.innerHTML = `
                        <div class="pvz_location__item_info">
                            <div class="pvz_location__item_info__top">
                                <div class="pvz_location__item_info__title">
                                    ${point.name}
                                </div>
                                <div class="pvz_location__item_info__adress">
                                    ${point.address}
                                </div>
                            </div>
                            <div class="pvz_location__item_info__bottom">
                                <span>
                                    Стоимость - ${point.cost}
                                </span>
                                <span>
                                    Дата доставки - ${point.date}
                                </span>
                            </div>
                        </div>
                        <button type="button" class="btn btn-primary">${isActive ? 'Выбрано' : 'Выбрать'}</button>
                    `;

                    // Обработчик клика на кнопку "Выбрать"
                    const selectBtn = pvzItem.querySelector('.btn');
                    selectBtn.addEventListener('click', () => {
                        // Если пункт уже выбран, закрываем модалку
                        if (selectedPvzIndex === index) {
                            closeModal();
                            return;
                        }
                        selectPvz(index);
                    });

                    pvzContainer.appendChild(pvzItem);
                });

                // Показываем сообщение, если ничего не найдено
                if (visibleCount === 0 && query) {
                    pvzContainer.innerHTML = '<div class="city_location__no-results">Нет подходящих пунктов выдачи</div>';
                }
            }

            // Функция выбора ПВЗ
            function selectPvz(index) {
                selectedPvzIndex = index;
                const point = pvzPoints[index];

                // Обновляем список с учетом текущего поискового запроса
                renderPvzList(currentSearchQuery);

                // Сбрасываем предыдущий выбранный маркер
                if (selectedMarker !== null && markers[selectedMarker]) {
                    if (markers[selectedMarker][0]) {
                        markers[selectedMarker][0].setIcon(createMarkerIcon(false));
                    }
                    if (markers[selectedMarker][1]) {
                        markers[selectedMarker][1].setIcon(createMarkerIcon(false));
                    }
                }

                selectedMarker = index;

                // Обновляем маркеры на обеих картах
                if (markers[index]) {
                    // Устанавливаем красный маркер на обеих картах
                    if (markers[index][0]) {
                        markers[index][0].setIcon(createMarkerIcon(true));
                    }
                    if (markers[index][1]) {
                        markers[index][1].setIcon(createMarkerIcon(true));
                    }
                }

                // Зумимся к выбранному маркеру на обеих картах (максимальный зум)
                if (map) {
                    map.setView([point.lat, point.lng], 20, {
                        animate: true,
                        duration: 0.5
                    });
                }
                if (mapMobile) {
                    mapMobile.setView([point.lat, point.lng], 20, {
                        animate: true,
                        duration: 0.5
                    });
                }

                // Обновляем инпут с адресом в форме заказа
                const pvzInput = document.querySelector('input[name="pvz_adress"]');
                const pvzLabel = document.querySelector('.input_pvz_label');
                const pvzValue = document.querySelector('.input_pvz__value');
                const pvzButton = document.querySelector('button[data-btn="delivery_pvz"]');

                if (pvzInput) {
                    const fullAddress = `${point.name} - ${point.address}`;
                    pvzInput.value = fullAddress;
                    pvzInput.setAttribute('value', fullAddress);
                }

                if (pvzValue) {
                    pvzValue.textContent = `${point.name} - ${point.address}`;
                }

                if (pvzLabel) {
                    pvzLabel.style.display = 'block';
                }

                if (pvzButton) {
                    pvzButton.textContent = 'Сменить ПВЗ';
                }
            }

            // Настройка поиска ПВЗ
            function setupPvzSearch() {
                const searchInput = modal.querySelector('.city_search_input');
                const clearButton = modal.querySelector('.search_clear');

                if (!searchInput || !clearButton) return;

                // Функция показа/скрытия кнопки очистки
                function toggleClearButton() {
                    if (searchInput.value.trim()) {
                        clearButton.style.display = 'flex';
                    } else {
                        clearButton.style.display = 'none';
                    }
                }

                // Обработчик ввода в поиск
                searchInput.addEventListener('input', (e) => {
                    currentSearchQuery = e.target.value;
                    renderPvzList(currentSearchQuery);
                    toggleClearButton();
                });

                // Обработчик кнопки очистки
                clearButton.addEventListener('click', () => {
                    searchInput.value = '';
                    currentSearchQuery = '';
                    searchInput.focus();
                    renderPvzList();
                    toggleClearButton();
                });
            }

            // Функция инициализации карты
            function initMap() {
                if (mapInitialized || !window.L) return;
                
                const mapContainer = modal.querySelector('#map');
                const mapContainerMobile = modal.querySelector('#map_mobile');
                if (!mapContainer && !mapContainerMobile) return;

                // Генерируем список ПВЗ
                renderPvzList();

                // Настраиваем поиск
                setupPvzSearch();

                // Инициализация основной карты (центр - Москва)
                if (mapContainer) {
                    map = L.map('map', { maxZoom: 20 }).setView([55.7558, 37.6173], 13);
                }

                // Инициализация мобильной карты
                if (mapContainerMobile) {
                    mapMobile = L.map('map_mobile', { maxZoom: 20 }).setView([55.7558, 37.6173], 13);
                }

                // Добавление тайлов на основную карту
                if (map) {
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        attribution: '© OpenStreetMap contributors © CARTO',
                        subdomains: 'abcd',
                        maxZoom: 20
                    }).addTo(map);
                }

                // Добавление тайлов на мобильную карту
                if (mapMobile) {
                    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                        attribution: '© OpenStreetMap contributors © CARTO',
                        subdomains: 'abcd',
                        maxZoom: 20
                    }).addTo(mapMobile);
                }

                // Создание кластера маркеров для основной карты
                if (window.L.markerClusterGroup && map) {
                    markerCluster = L.markerClusterGroup({
                        chunkedLoading: true,
                        maxClusterRadius: 50,
                        iconCreateFunction: function(cluster) {
                            const count = cluster.getChildCount();
                            return L.divIcon({
                                html: `<div class="custom-cluster"><span>${count}</span></div>`,
                                className: 'custom-cluster-icon',
                                iconSize: L.point(40, 40)
                            });
                        }
                    });
                }

                // Создание кластера маркеров для мобильной карты
                if (window.L.markerClusterGroup && mapMobile) {
                    markerClusterMobile = L.markerClusterGroup({
                        chunkedLoading: true,
                        maxClusterRadius: 50,
                        iconCreateFunction: function(cluster) {
                            const count = cluster.getChildCount();
                            return L.divIcon({
                                html: `<div class="custom-cluster"><span>${count}</span></div>`,
                                className: 'custom-cluster-icon',
                                iconSize: L.point(40, 40)
                            });
                        }
                    });
                }

                // Добавление маркеров на обе карты
                if (markerCluster || markerClusterMobile) {
                    pvzPoints.forEach((point, index) => {
                        // Создаем маркеры для хранения
                        if (!markers[index]) markers[index] = [];

                        // Маркер для основной карты
                        if (markerCluster) {
                            const marker = L.marker([point.lat, point.lng], {
                                icon: createMarkerIcon(false),
                                title: point.name
                            });

                            markers[index][0] = marker;

                            marker.on('click', function() {
                                // Если маркер уже выбран, закрываем модалку
                                if (selectedPvzIndex === index) {
                                    closeModal();
                                    return;
                                }
                                selectPvz(index);
                            });

                            markerCluster.addLayer(marker);
                        }

                        // Маркер для мобильной карты
                        if (markerClusterMobile) {
                            const markerMobile = L.marker([point.lat, point.lng], {
                                icon: createMarkerIcon(false),
                                title: point.name
                            });

                            markers[index][1] = markerMobile;

                            markerMobile.on('click', function() {
                                // Если маркер уже выбран, закрываем модалку
                                if (selectedPvzIndex === index) {
                                    closeModal();
                                    return;
                                }
                                selectPvz(index);
                            });

                            markerClusterMobile.addLayer(markerMobile);
                        }
                    });

                    // Добавление кластеров на карты
                    if (markerCluster && map) {
                        map.addLayer(markerCluster);
                    }
                    if (markerClusterMobile && mapMobile) {
                        mapMobile.addLayer(markerClusterMobile);
                    }
                }

                mapInitialized = true;

                // Небольшая задержка для корректного отображения карт
                setTimeout(() => {
                    if (map) map.invalidateSize();
                    if (mapMobile) mapMobile.invalidateSize();
                }, 100);
            }

            // Инициализация карты при открытии модалки
            const originalOpenModalFunc = openModal;
            openModal = function() {
                originalOpenModalFunc();
                // Инициализируем карту после открытия модалки
                setTimeout(() => {
                    initMap();
                }, 300);
            };

            // Очистка карты при закрытии модалки
            const originalCloseModalFunc = closeModal;
            closeModal = function() {
                originalCloseModalFunc();
                // Можно удалить карту при закрытии, если нужно
                // if (map) {
                //     map.remove();
                //     map = null;
                //     mapInitialized = false;
                // }
            };
        }

        // Обработка модалки выбора города
        if (modalId === 'city_order') {
            const cityItems = modal.querySelectorAll('.city_location__item');
            const citySearchInput = modal.querySelector('.city_search_input');
            const citySearchClear = modal.querySelector('.search_clear');
            const cityTitle = document.querySelector('.order_page_contact__city_title');
            // Ищем input внутри формы заказа
            const orderForm = document.querySelector('.order_form');
            const cityInput = orderForm ? orderForm.querySelector('input[name="city"]') : document.querySelector('input[name="city"]');
            const btnLocation = modal.querySelector('.btn_location');

            // Обработка выбора города
            cityItems.forEach(item => {
                item.addEventListener('click', function() {
                    const cityValue = this.dataset.value;
                    
                    // Обновляем активный элемент
                    cityItems.forEach(cityItem => {
                        cityItem.classList.remove('is-active');
                    });
                    this.classList.add('is-active');
                    
                    // Обновляем значение в поле поиска
                    if (citySearchInput) {
                        citySearchInput.value = cityValue;
                        toggleClearButton();
                    }
                    
                    // Обновляем значение в форме
                    if (cityTitle) {
                        cityTitle.textContent = cityValue;
                    }
                    if (cityInput) {
                        // Обновляем значение через setAttribute для readonly input
                        cityInput.setAttribute('value', cityValue);
                        cityInput.value = cityValue;
                        // Триггерим событие change для readonly input
                        const changeEvent = new Event('change', { bubbles: true });
                        cityInput.dispatchEvent(changeEvent);
                        const inputEvent = new Event('input', { bubbles: true });
                        cityInput.dispatchEvent(inputEvent);
                    } else {
                        console.warn('cityInput не найден');
                    }
                    
                    // Скрываем сообщение "Нет результатов", если оно было показано
                    if (noResultsMessage) {
                        noResultsMessage.style.display = 'none';
                    }
                    
                    // Показываем все города перед закрытием
                    cityItems.forEach(cityItem => {
                        cityItem.style.display = '';
                    });
                    
                    // Закрываем модалку
                    closeModal();
                });
            });

            // Функция для показа/скрытия кнопки очистки
            function toggleClearButton() {
                if (citySearchClear && citySearchInput) {
                    if (citySearchInput.value.trim()) {
                        citySearchClear.style.display = 'flex';
                    } else {
                        citySearchClear.style.display = 'none';
                    }
                }
            }

            // Поиск городов
            const noResultsMessage = modal.querySelector('.city_location__no-results');
            
            if (citySearchInput) {
                citySearchInput.addEventListener('input', function() {
                    const searchValue = this.value.toLowerCase().trim();
                    
                    // Показываем/скрываем кнопку очистки
                    toggleClearButton();
                    
                    let hasVisibleItems = false;
                    
                    cityItems.forEach(item => {
                        const cityName = item.textContent.toLowerCase();
                        if (cityName.includes(searchValue)) {
                            item.style.display = '';
                            hasVisibleItems = true;
                        } else {
                            item.style.display = 'none';
                        }
                    });
                    
                    // Показываем/скрываем сообщение "Нет результатов"
                    if (noResultsMessage) {
                        if (searchValue && !hasVisibleItems) {
                            noResultsMessage.style.display = 'block';
                        } else {
                            noResultsMessage.style.display = 'none';
                        }
                    }
                });
            }

            // Обработка кнопки очистки
            if (citySearchClear) {
                citySearchClear.addEventListener('click', function() {
                    if (citySearchInput) {
                        citySearchInput.value = '';
                        citySearchInput.focus();
                        toggleClearButton();
                        
                        // Показываем все города
                        cityItems.forEach(item => {
                            item.style.display = '';
                        });
                        
                        // Скрываем сообщение "Нет результатов"
                        if (noResultsMessage) {
                            noResultsMessage.style.display = 'none';
                        }
                    }
                });
            }

            // Обработка кнопки "Определить местоположение"
            if (btnLocation) {
                btnLocation.addEventListener('click', function() {
                    if (navigator.geolocation) {
                        const originalText = btnLocation.textContent;
                        btnLocation.textContent = 'Определение...';
                        btnLocation.disabled = true;
                        
                        navigator.geolocation.getCurrentPosition(
                            function(position) {
                                const lat = position.coords.latitude;
                                const lon = position.coords.longitude;
                                
                                // Используем Nominatim API для обратного геокодинга
                                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`)
                                    .then(response => response.json())
                                    .then(data => {
                                        // Извлекаем название города из ответа
                                        let cityName = '';
                                        
                                        if (data.address) {
                                            // Пробуем разные варианты названия города
                                            cityName = data.address.city || 
                                                      data.address.town || 
                                                      data.address.village || 
                                                      data.address.municipality ||
                                                      data.address.county ||
                                                      '';
                                        }
                                        
                                        if (cityName) {
                                            // Вставляем город в поле поиска
                                            if (citySearchInput) {
                                                citySearchInput.value = cityName;
                                                toggleClearButton();
                                                // Триггерим событие input для фильтрации
                                                citySearchInput.dispatchEvent(new Event('input'));
                                                
                                                // Находим и выбираем соответствующий город из списка
                                                let foundItem = null;
                                                cityItems.forEach(item => {
                                                    if (item.textContent.toLowerCase().includes(cityName.toLowerCase())) {
                                                        foundItem = item;
                                                        // Обновляем активный элемент
                                                        cityItems.forEach(cityItem => {
                                                            cityItem.classList.remove('is-active');
                                                        });
                                                        item.classList.add('is-active');
                                                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        item.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                                                        setTimeout(() => {
                                                            item.style.backgroundColor = '';
                                                        }, 2000);
                                                    }
                                                });
                                                
                                                // Обновляем значение в форме, если город найден
                                                if (foundItem) {
                                                    const cityValue = foundItem.dataset.value || cityName;
                                                    if (cityTitle) {
                                                        cityTitle.textContent = cityValue;
                                                    }
                                                    if (cityInput) {
                                                        // Обновляем значение через setAttribute для readonly input
                                                        cityInput.setAttribute('value', cityValue);
                                                        cityInput.value = cityValue;
                                                        // Триггерим событие change для readonly input
                                                        cityInput.dispatchEvent(new Event('change', { bubbles: true }));
                                                        cityInput.dispatchEvent(new Event('input', { bubbles: true }));
                                                    }
                                                }
                                            }
                                        } else {
                                            alert('Не удалось определить город по местоположению');
                                        }
                                        
                                        btnLocation.textContent = originalText;
                                        btnLocation.disabled = false;
                                    })
                                    .catch(error => {
                                        console.error('Ошибка при определении города:', error);
                                        alert('Не удалось определить город. Попробуйте еще раз.');
                                        btnLocation.textContent = originalText;
                                        btnLocation.disabled = false;
                                    });
                            },
                            function(error) {
                                let errorMessage = 'Не удалось определить местоположение';
                                switch(error.code) {
                                    case error.PERMISSION_DENIED:
                                        errorMessage = 'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.';
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        errorMessage = 'Информация о местоположении недоступна.';
                                        break;
                                    case error.TIMEOUT:
                                        errorMessage = 'Время ожидания определения местоположения истекло.';
                                        break;
                                }
                                alert(errorMessage);
                                btnLocation.textContent = originalText;
                                btnLocation.disabled = false;
                            },
                            {
                                enableHighAccuracy: true,
                                timeout: 10000,
                                maximumAge: 0
                            }
                        );
                    } else {
                        alert('Геолокация не поддерживается вашим браузером');
                    }
                });
            }

            // Функция для сброса поиска
            function resetCitySearch() {
                if (citySearchInput) {
                    citySearchInput.value = '';
                    toggleClearButton();
                    cityItems.forEach(item => {
                        item.style.display = '';
                    });
                    if (noResultsMessage) {
                        noResultsMessage.style.display = 'none';
                    }
                }
            }

            // Сброс поиска при открытии модалки
            // Перехватываем открытие модалки через переопределение openModal
            const originalOpenModalFunc = openModal;
            openModal = function() {
                originalOpenModalFunc();
                resetCitySearch();
                // Проверяем, нужно ли показать кнопку очистки
                if (citySearchInput && citySearchInput.value.trim()) {
                    toggleClearButton();
                }
            };
        }
    });

    //   анимации
    const animatedElements = document.querySelectorAll('[data-animation]');

    function isElementInViewport(el, percent = 30) {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const offset = windowHeight * percent / 100;

        return (
            rect.top <= windowHeight - offset &&
            rect.bottom >= 0
        );
    }

    function handleAnimation() {
        animatedElements.forEach(el => {
            if (isElementInViewport(el)) {
                const animationType = el.getAttribute('data-animation');

                if (animationType === 'right') {
                    el.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
                    el.style.transform = 'translateX(0)';
                    el.style.opacity = '1';
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
            el.style.opacity = '0';
        } else if (animationType === 'opacity_top') {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
        }
    });

    window.addEventListener('load', handleAnimation);
    window.addEventListener('scroll', handleAnimation);

    handleAnimation();




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
                utilsScript: '/wp-content/themes/ydrn-mtrn/assets/scripts/utils.js',
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


    // FAQ accordion — delegated handler (works for dynamic content)
    (function () {
        document.addEventListener('click', function (e) {
            const item = e.target.closest('.faq-item');
            if (!item) return; // click was not on a faq item

            // Close all other open items (query live list each time)
            document.querySelectorAll('.faq-item.is-open').forEach(other => {
                if (other !== item) other.classList.remove('is-open');
            });

            // Toggle current
            item.classList.add('is-open');
        });
    })();

    // Обработка кликов на gift-sum-item для ввода значения в инпут
    (function () {
        const giftSumInput = document.querySelector('.gift-sum');
        if (!giftSumInput) return;

        document.addEventListener('click', function (e) {
            const giftSumItem = e.target.closest('.gift-sum-item');
            if (!giftSumItem) return;

            // Находим span с суммой внутри gift-sum-item
            const span = giftSumItem.querySelector('span');
            if (span) {
                const sumValue = span.textContent.trim();
                giftSumInput.value = sumValue;
            }
        });
    })();

    // Копирование ссылки при клике на "Скопировать ссылку"
    // Копирование ссылки при клике на "Скопировать ссылку"
    (function () {
        const copyBtn = document.querySelector('.copy-link');
        if (!copyBtn) return;

        // Находим текстовый узел внутри кнопки (после картинки)
        const textNode = Array.from(copyBtn.childNodes).find(
            n => n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ''
        );

        copyBtn.addEventListener('click', async () => {
            try {
                const url = window.location.href; // Текущий URL
                await navigator.clipboard.writeText(url);

                // Меняем только текст
                if (textNode) textNode.textContent = ' Ссылка скопирована!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    if (textNode) textNode.textContent = ' Скопировать ссылку';
                    copyBtn.classList.remove('copied');
                }, 1000);
            } catch (err) {
                if (textNode) textNode.textContent = ' Ошибка копирования';
                setTimeout(() => {
                    if (textNode) textNode.textContent = ' Скопировать ссылку';
                }, 1000);
            }
        });
    })();

    // Копирование ссылки при клике на «Поделиться» на странице товара (актив 2 сек)
    (function () {
        const shareBtn = document.querySelector('.product_page__share');
        if (!shareBtn) return;

        shareBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await navigator.clipboard.writeText(window.location.href);
                shareBtn.classList.add('is-active');
                setTimeout(() => shareBtn.classList.remove('is-active'), 5000);
            } catch (err) {
                console.error('Не удалось скопировать ссылку', err);
            }
        });
    })();

    // Переключение картинок товара при выборе опций (модель + цвет)
    (function () {
        const section = document.querySelector('.product_page');
        if (!section) return;

        const wrappers = section.querySelectorAll('.product_page_img[data-img-wrapper]');
        const stationItems = section.querySelectorAll('.tab-item[data-tab-station]');
        const colorItems = section.querySelectorAll('.tab-item[data-tab-color]');

        function getActiveStation() {
            const active = section.querySelector('.tab-item[data-tab-station].is-active');
            return active ? active.getAttribute('data-tab-station') : 'mini';
        }
        function getActiveColor() {
            const active = section.querySelector('.tab-item[data-tab-color].is-active');
            return active ? active.getAttribute('data-tab-color') : 'red';
        }
        function showWrapper(id) {
            wrappers.forEach(el => {
                el.style.display = el.getAttribute('data-img-wrapper') === id ? '' : 'none';
            });
        }
        function updateImage() {
            const station = getActiveStation();
            const color = getActiveColor();
            const wrapperId = station + '-' + color;
            const hasMatch = Array.from(wrappers).some(el => el.getAttribute('data-img-wrapper') === wrapperId);
            if (hasMatch) showWrapper(wrapperId);
            else {
                // fallback: показать первый доступный для выбранной модели или первый вообще
                const fallback = Array.from(wrappers).find(el => el.getAttribute('data-img-wrapper').startsWith(station + '-'))
                    || wrappers[0];
                if (fallback) {
                    wrappers.forEach(el => { el.style.display = el === fallback ? '' : 'none'; });
                }
            }
        }

        stationItems.forEach(el => {
            el.addEventListener('click', function () {
                stationItems.forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                updateImage();
            });
        });
        colorItems.forEach(el => {
            el.addEventListener('click', function () {
                colorItems.forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                updateImage();
            });
        });

        updateImage();
    })();

    // Свайпер галереи товара .product_page_img: только до 1000px; до 768 — 1 слайд, от 768 — 2 слайда
    (function () {
        const section = document.querySelector('.product_page');
        if (!section || typeof Swiper === 'undefined') return;

        const containers = section.querySelectorAll('.product_page_img.swiper[data-img-wrapper]');
        const instances = new Map();

        function restoreWrappersVisibility() {
            var activeStation = section.querySelector('.tab-item[data-tab-station].is-active');
            var activeColor = section.querySelector('.tab-item[data-tab-color].is-active');
            var station = activeStation ? activeStation.getAttribute('data-tab-station') : 'mini';
            var color = activeColor ? activeColor.getAttribute('data-tab-color') : 'red';
            var wrapperId = station + '-' + color;
            var hasMatch = Array.from(containers).some(function (el) { return el.getAttribute('data-img-wrapper') === wrapperId; });
            if (hasMatch) {
                containers.forEach(function (el) {
                    el.style.display = el.getAttribute('data-img-wrapper') === wrapperId ? '' : 'none';
                });
            } else {
                var fallback = Array.from(containers).find(function (el) { return el.getAttribute('data-img-wrapper').startsWith(station + '-'); }) || containers[0];
                if (fallback) {
                    containers.forEach(function (el) {
                        el.style.display = el === fallback ? '' : 'none';
                    });
                }
            }
        }

        function initProductPageImgSwipers() {
            const w = window.innerWidth;
            if (w > 1000) {
                instances.forEach(function (swiper, el) {
                    swiper.destroy(true, true);
                    instances.delete(el);
                });
                restoreWrappersVisibility();
                return;
            }
            containers.forEach(function (el) {
                if (instances.has(el)) return;
                const paginationEl = el.querySelector('.product_page_img__pagination');
                const prevEl = el.querySelector('.product_page_img__nav_prev');
                const nextEl = el.querySelector('.product_page_img__nav_next');
                const swiper = new Swiper(el, {
                    slidesPerView: 1,
                    spaceBetween: 20,
                    breakpoints: {
                        768: {
                            slidesPerView: 2,
                            spaceBetween: 20,
                        },
                    },
                    pagination: paginationEl ? {
                        el: paginationEl,
                        clickable: true,
                        type: 'bullets',
                    } : false,
                    navigation: (prevEl && nextEl) ? {
                        prevEl: prevEl,
                        nextEl: nextEl,
                    } : false,
                    allowTouchMove: true,
                    grabCursor: true,
                });
                instances.set(el, swiper);
            });
        }

        function destroyProductPageImgSwipers() {
            instances.forEach(function (swiper, el) {
                swiper.destroy(true, true);
            });
            instances.clear();
            restoreWrappersVisibility();
        }

        initProductPageImgSwipers();
        window.addEventListener('resize', function () {
            const w = window.innerWidth;
            if (w > 1000) destroyProductPageImgSwipers();
            else initProductPageImgSwipers();
        });
    })();

    // Sticky блок инфо товара: при скролле страницы контент внутри тоже «листается» (как в oemen)
    (function () {
        const productPageInfo = document.querySelector('.product_page_info');
        const contentWrapper = productPageInfo && productPageInfo.querySelector('.product_page_info__content');
        if (!productPageInfo || !contentWrapper) return;

        let lastScrollY = window.scrollY;
        let currentContentScroll = 0;
        let isUserScrolling = false;
        let scrollTimeout = null;
        let lastContentHeight = 0;

        function getStickyTop() {
            return window.innerWidth >= 1350 ? 0 : 56;
        }

        function updateStickyScroll(isManualScroll) {
            const w = window.innerWidth;
            if (w < 1000) {
                contentWrapper.style.transform = 'translateY(0)';
                currentContentScroll = 0;
                return;
            }

            const stickyTop = getStickyTop();
            const isStickyNow = productPageInfo.getBoundingClientRect().top <= stickyTop;
            const contentHeight = contentWrapper.scrollHeight;
            const viewportHeight = window.innerHeight - stickyTop;
            const canScroll = contentHeight > viewportHeight;

            if (isStickyNow && canScroll) {
                const maxScroll = Math.max(0, contentHeight - viewportHeight);
                const scrollDelta = window.scrollY - lastScrollY;

                if (contentHeight > lastContentHeight && lastContentHeight > 0) {
                    const oldMaxScroll = Math.max(0, lastContentHeight - viewportHeight);
                    if (currentContentScroll >= oldMaxScroll - 20) {
                        currentContentScroll = maxScroll;
                        contentWrapper.classList.remove('product_page_info__content--scrolling');
                        requestAnimationFrame(function () {
                            contentWrapper.style.transform = 'translateY(-' + currentContentScroll + 'px)';
                        });
                    }
                }

                if (scrollDelta !== 0 && isManualScroll) {
                    currentContentScroll += scrollDelta;
                    currentContentScroll = Math.max(0, Math.min(maxScroll, currentContentScroll));
                    contentWrapper.classList.add('product_page_info__content--scrolling');
                }

                contentWrapper.style.transform = 'translateY(-' + currentContentScroll + 'px)';

                if (isManualScroll) {
                    clearTimeout(scrollTimeout);
                    scrollTimeout = setTimeout(function () {
                        contentWrapper.classList.remove('product_page_info__content--scrolling');
                    }, 150);
                }
            } else {
                currentContentScroll = 0;
                contentWrapper.style.transform = 'translateY(0)';
            }

            lastScrollY = window.scrollY;
            lastContentHeight = contentHeight;
        }

        window.addEventListener('scroll', function () {
            if (window.innerWidth < 1000) return;
            isUserScrolling = true;
            updateStickyScroll(true);
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(function () { isUserScrolling = false; }, 100);
        }, { passive: true });

        var resizeObserver = new ResizeObserver(function () {
            if (window.innerWidth < 1000) return;
            updateStickyScroll(!isUserScrolling);
        });
        resizeObserver.observe(contentWrapper);

        window.addEventListener('resize', function () {
            updateStickyScroll(false);
        }, { passive: true });

        updateStickyScroll(false);
    })();

    // Обработка кликов по кнопкам лайков в карточках товаров
    (function () {
        document.addEventListener('click', function (e) {
            const likeBtn = e.target.closest('.product_card__like');
            if (!likeBtn) return;

            e.preventDefault();
            e.stopPropagation();
            
            // Переключаем класс is-active
            likeBtn.classList.toggle('is-active');
        });
    })();

    // Инициализация Swiper для карточек товаров
    (function () {
        const productCardSwipers = document.querySelectorAll('.product_card_img.swiper');
        
        if (productCardSwipers.length && typeof Swiper !== 'undefined') {
            productCardSwipers.forEach((swiperEl, index) => {
                const paginationEl = swiperEl.querySelector('.product_img_pagination');
                const prevEl = swiperEl.querySelector('.product_img_nav_prev');
                const nextEl = swiperEl.querySelector('.product_img_nav_next');
                const slides = swiperEl.querySelectorAll('.swiper-slide');
                const slidesCount = slides.length;

                // Скрываем навигацию и пагинацию, если слайдов меньше 2
                if (slidesCount < 2) {
                    if (paginationEl) paginationEl.style.display = 'none';
                    if (prevEl) prevEl.style.display = 'none';
                    if (nextEl) nextEl.style.display = 'none';
                    return;
                }

                const swiper = new Swiper(swiperEl, {
                    slidesPerView: 1,
                    spaceBetween: 0,
                    loop: slidesCount > 1,
                    pagination: paginationEl ? {
                        el: paginationEl,
                        clickable: true,
                        type: 'bullets',
                    } : false,
                    navigation: (prevEl && nextEl) ? {
                        nextEl: nextEl,
                        prevEl: prevEl,
                    } : false,
                    allowTouchMove: true,
                    grabCursor: true,
                });
            });
        }
    })();

    // Инициализация Swiper блока «Вам может понравиться» (.swiper_product): 3 на ПК, 2 на мобилке
    (function () {
        const el = document.querySelector('.swiper_product');
        if (!el || typeof Swiper === 'undefined') return;
        const prevEl = el.querySelector('.swiper_product__nav_prev');
        const nextEl = el.querySelector('.swiper_product__nav_next');
        new Swiper(el, {
            slidesPerView: 2,
            spaceBetween: 20,
            breakpoints: {
                768: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                },
            },
            navigation: (prevEl && nextEl) ? {
                nextEl: nextEl,
                prevEl: prevEl,
            } : false,
            allowTouchMove: true,
            grabCursor: true,
        });
    })();

    // Функциональность счетчика товаров в корзине
    (function () {
        // Функция для обновления состояния кнопки минус
        function updateMinusButtonState(counter) {
            const countInput = counter.querySelector('.product_counter__count');
            const minusBtn = counter.querySelector('.product_counter__minus');
            
            if (!countInput || !minusBtn) return;
            
            const currentValue = parseInt(countInput.value) || 1;
            
            if (currentValue <= 1) {
                minusBtn.classList.add('is-disabled');
            } else {
                minusBtn.classList.remove('is-disabled');
            }
        }
        
        // Инициализация состояния всех счетчиков при загрузке
        document.querySelectorAll('.product_counter').forEach(counter => {
            updateMinusButtonState(counter);
        });
        
        document.addEventListener('click', function (e) {
            const minusBtn = e.target.closest('.product_counter__minus');
            const plusBtn = e.target.closest('.product_counter__plus');
            
            if (minusBtn || plusBtn) {
                const counter = e.target.closest('.product_counter');
                if (!counter) return;
                
                const countInput = counter.querySelector('.product_counter__count');
                if (!countInput) return;
                
                let currentValue = parseInt(countInput.value) || 1;
                
                if (minusBtn && !minusBtn.classList.contains('is-disabled')) {
                    // Уменьшаем значение, но не меньше 1
                    if (currentValue > 1) {
                        currentValue--;
                        countInput.value = currentValue;
                        updateMinusButtonState(counter);
                    }
                } else if (plusBtn) {
                    // Увеличиваем значение
                    currentValue++;
                    countInput.value = currentValue;
                    updateMinusButtonState(counter);
                }
            }
        });
    })();

    // Обработка промокода
    (function () {
        const promoForm = document.querySelector('.modal_cart__promo');
        if (!promoForm) return;

        const promoInput = promoForm.querySelector('.promo-input');
        const promoBtn = promoForm.querySelector('.btn_promo');
        const promoOk = promoForm.querySelector('.modal_cart__promo_ok');
        const promoDel = promoForm.querySelector('.promo_del');
        const promoInputWrapper = promoForm.querySelector('.promo_input_wrapper');

        // Валидный промокод
        const VALID_PROMO = 'ВАУ';

        // Функция для сброса состояния ошибки
        function resetError() {
            if (promoInput) {
                promoInput.classList.remove('is-err');
            }
        }

        // Функция для показа ошибки
        function showError() {
            if (promoInput) {
                promoInput.classList.add('is-err');
            }
        }

        // Функция для применения промокода
        function applyPromo() {
            if (promoForm && promoInputWrapper && promoOk && promoInput) {
                promoForm.classList.add('form_ok');
                promoOk.style.display = 'flex';
                promoInput.setAttribute('readonly', 'readonly');
                resetError();
            }
        }

        // Функция для удаления промокода
        function removePromo() {
            if (promoForm && promoInputWrapper && promoOk && promoInput) {
                promoForm.classList.remove('form_ok');
                promoOk.style.display = 'none';
                promoInput.removeAttribute('readonly');
                promoInput.value = '';
                resetError();
            }
        }

        // Функция для обработки промокода
        function handlePromoSubmit() {
            if (!promoInput) return;

            const promoValue = promoInput.value.trim().toUpperCase();

            // Если инпут пустой - просто фокус, без ошибки
            if (promoValue === '') {
                promoInput.focus();
                resetError();
                return;
            }

            // Проверка на валидный промокод
            if (promoValue === VALID_PROMO.toUpperCase()) {
                applyPromo();
            } else {
                showError();
            }
        }

        // Обработка клика на кнопку промокода
        if (promoBtn) {
            promoBtn.addEventListener('click', function (e) {
                e.preventDefault();
                handlePromoSubmit();
            });
        }

        // Обработка Enter в поле промокода
        if (promoInput) {
            promoInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePromoSubmit();
                }
            });
        }

        // Обработка кнопки удаления промокода
        if (promoDel) {
            promoDel.addEventListener('click', function (e) {
                e.preventDefault();
                removePromo();
            });
        }

        // Сброс ошибки при вводе
        if (promoInput) {
            promoInput.addEventListener('input', function () {
                resetError();
            });
        }
    })();

    // Валидация формы заказа
    (function () {
        const orderForm = document.querySelector('.order_form');
        if (!orderForm) return;

        const deliveryRadios = orderForm.querySelectorAll('input[name="delivery"]');
        const pvzInput = orderForm.querySelector('input[name="pvz_adress"]');
        const pvzLabel = orderForm.querySelector('.input_pvz_label');
        const pvzErrMsg = orderForm.querySelector('.order_page_contact__delivery_item .err-msg');
        const firstDeliveryItem = orderForm.querySelector('.order_page_contact__delivery_item');

        // Функция для сброса ошибки ПВЗ
        function resetPvzError() {
            if (pvzInput) {
                pvzInput.classList.remove('is-err');
            }
            if (pvzErrMsg) {
                pvzErrMsg.style.display = 'none';
            }
        }

        // Функция для показа ошибки ПВЗ
        function showPvzError() {
            if (pvzInput) {
                pvzInput.classList.add('is-err');
            }
            if (pvzErrMsg) {
                pvzErrMsg.style.display = 'block';
            }
        }

        // Проверка, виден ли элемент (учитывает inline styles и computed styles)
        function isElementVisible(element) {
            if (!element) return false;
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        }

        // Функция для добавления ошибки к полю
        function showFieldError(input) {
            if (!input) return;
            input.classList.add('is-err');
            const inputWrapper = input.closest('.input_wrapper');
            if (inputWrapper) {
                const errMsg = inputWrapper.querySelector('.err-msg');
                if (errMsg) {
                    errMsg.style.display = 'block';
                }
            }
        }

        // Функция для сброса ошибки поля
        function resetFieldError(input) {
            if (!input) return;
            input.classList.remove('is-err');
            const inputWrapper = input.closest('.input_wrapper');
            if (inputWrapper) {
                const errMsg = inputWrapper.querySelector('.err-msg');
                if (errMsg) {
                    errMsg.style.display = 'none';
                }
            }
        }

        // Проверка валидности формы
        function validateOrderForm() {
            let isValid = true;

            // Проверяем, выбран ли способ доставки "До ПВЗ СДЭК" (первый radio)
            const firstDeliveryRadio = deliveryRadios[0];
            
            if (firstDeliveryRadio && firstDeliveryRadio.checked) {
                // Проверяем, выбран ли ПВЗ
                // ПВЗ считается выбранным, если label виден или input имеет значение
                const pvzValue = pvzInput ? pvzInput.value.trim() : '';
                const isPvzLabelVisible = isElementVisible(pvzLabel);
                
                // Если label не виден или input пустой, значит ПВЗ не выбран
                if (!isPvzLabelVisible || !pvzValue) {
                    showPvzError();
                    isValid = false;
                } else {
                    resetPvzError();
                }
            } else {
                resetPvzError();
            }

            // Проверяем все обязательные поля формы
            const requiredInputs = orderForm.querySelectorAll('input[required]');
            requiredInputs.forEach(input => {
                // Пропускаем скрытые поля
                const inputWrapper = input.closest('.input_wrapper');
                if (inputWrapper) {
                    const wrapperDisplay = window.getComputedStyle(inputWrapper).display;
                    if (wrapperDisplay === 'none') {
                        resetFieldError(input);
                        return;
                    }
                }

                // Пропускаем скрытые блоки
                const parentBlock = input.closest('.order_page_contact_item');
                if (parentBlock) {
                    const blockDisplay = window.getComputedStyle(parentBlock).display;
                    if (blockDisplay === 'none') {
                        resetFieldError(input);
                        return;
                    }
                }

                const value = input.value.trim();
                const isEmpty = value === '';
                
                // Проверка email
                if (input.type === 'email' && value) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        showFieldError(input);
                        isValid = false;
                        return;
                    }
                }

                // Проверка телефона (если это поле телефона)
                if (input.classList.contains('phone-input') && value) {
                    // Базовая проверка - минимум 10 цифр
                    const digitsOnly = value.replace(/\D/g, '');
                    if (digitsOnly.length < 10) {
                        showFieldError(input);
                        isValid = false;
                        return;
                    }
                }

                if (isEmpty) {
                    showFieldError(input);
                    isValid = false;
                } else {
                    resetFieldError(input);
                }
            });

            return isValid;
        }

        // Обработка отправки формы
        orderForm.addEventListener('submit', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Сначала сбрасываем все ошибки
            const allInputs = orderForm.querySelectorAll('input');
            allInputs.forEach(input => {
                resetFieldError(input);
            });

            // Затем выполняем валидацию
            if (!validateOrderForm()) {
                // Прокручиваем к первой ошибке
                const firstError = orderForm.querySelector('.is-err');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Если это readonly input, фокусируемся на кнопке выбора ПВЗ
                    if (firstError.readOnly) {
                        const pvzSelectBtn = orderForm.querySelector('[data-btn="delivery_pvz"]');
                        if (pvzSelectBtn) {
                            pvzSelectBtn.focus();
                        }
                    } else {
                        firstError.focus();
                    }
                }
                return false;
            }

            // Если валидация прошла, можно отправить форму
            // Здесь можно добавить отправку данных на сервер
            console.log('Форма валидна, можно отправлять');
            // orderForm.submit(); // Раскомментируйте, когда будете готовы отправлять форму
            return false;
        });

        // Автоматический сброс ошибок при вводе
        const allFormInputs = orderForm.querySelectorAll('input');
        allFormInputs.forEach(input => {
            input.addEventListener('input', function() {
                resetFieldError(input);
            });
        });

        // Управление блоком "Адрес доставки" в зависимости от способа доставки
        let addressBlockItem = null;
        
        // Ищем блок адреса доставки
        const allContactItems = orderForm.querySelectorAll('.order_page_contact_item');
        allContactItems.forEach(item => {
            const title = item.querySelector('.order_page_contact_item__title');
            if (title && title.textContent.trim() === 'Адрес доставки') {
                addressBlockItem = item;
            }
        });
        
        const addressInput = addressBlockItem ? addressBlockItem.querySelector('input[name="adress"]') : null;
        
        // Функция для показа/скрытия блока адреса
        function toggleAddressBlock() {
            if (!addressBlockItem) return;
            
            // Второй radio (index 1) - "Курьером"
            const courierRadio = deliveryRadios[1];
            const isCourierSelected = courierRadio && courierRadio.checked;
            
            addressBlockItem.style.display = isCourierSelected ? 'grid' : 'none';
            
            if (addressInput) {
                // Устанавливаем required в зависимости от выбранного способа доставки
                if (isCourierSelected) {
                    addressInput.setAttribute('required', 'required');
                } else {
                    addressInput.removeAttribute('required');
                    addressInput.value = '';
                    addressInput.classList.remove('is-err');
                    const addressErrMsg = addressBlockItem.querySelector('.err-msg');
                    if (addressErrMsg) {
                        addressErrMsg.style.display = 'none';
                    }
                }
            }
        }
        
        // Сброс ошибки при изменении способа доставки
        if (deliveryRadios.length) {
            deliveryRadios.forEach(radio => {
                radio.addEventListener('change', function () {
                    resetPvzError();
                    toggleAddressBlock();
                });
            });
        }
        
        // Инициализация при загрузке страницы
        toggleAddressBlock();

        // Сброс ошибки при изменении значения ПВЗ
        if (pvzInput) {
            // Используем MutationObserver для отслеживания изменений readonly input
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
                        if (pvzInput.value.trim()) {
                            resetPvzError();
                        }
                    }
                });
            });
            
            observer.observe(pvzInput, {
                attributes: true,
                attributeFilter: ['value']
            });

            // Также слушаем события input (на случай, если input станет редактируемым)
            pvzInput.addEventListener('input', function () {
                if (pvzInput.value.trim()) {
                    resetPvzError();
                }
            });
        }

        // Сброс ошибки при изменении видимости label ПВЗ
        if (pvzLabel) {
            const labelObserver = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (isElementVisible(pvzLabel) && pvzInput && pvzInput.value.trim()) {
                            resetPvzError();
                        }
                    }
                });
            });
            
            labelObserver.observe(pvzLabel, {
                attributes: true,
                attributeFilter: ['style']
            });
        }

        // Предотвращаем отправку формы при клике на кнопки с data-btn
        const actionButtons = orderForm.querySelectorAll('[data-btn]');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Эти кнопки не должны отправлять форму
            });
        });

        // Обработка чекбокса "Совпадают с получателем"
        const contactDubbleCheckbox = orderForm.querySelector('input[name="contact_dubble"]');
        if (contactDubbleCheckbox) {
            // Находим блок "Ваши данные" - это родительский order_page_contact_item
            const yourDataBlock = contactDubbleCheckbox.closest('.order_page_contact_item');
            if (yourDataBlock) {
                // Находим все input_wrapper в блоке "Ваши данные"
                const allInputWrappers = yourDataBlock.querySelectorAll('.input_wrapper');
                let nameInputWrapper = null;
                let phoneInputWrapper = null;
                
                // Ищем нужные поля
                allInputWrappers.forEach(wrapper => {
                    const nameInput = wrapper.querySelector('input[name="name"]');
                    const phoneInput = wrapper.querySelector('input[name="phone"]');
                    if (nameInput && !nameInputWrapper) {
                        nameInputWrapper = wrapper;
                    }
                    if (phoneInput && !phoneInputWrapper) {
                        phoneInputWrapper = wrapper;
                    }
                });
                
                // Функция для показа/скрытия полей
                function toggleContactFields() {
                    const isChecked = contactDubbleCheckbox.checked;
                    
                    if (nameInputWrapper) {
                        nameInputWrapper.style.display = isChecked ? 'none' : 'flex';
                        const nameInput = nameInputWrapper.querySelector('input[name="name"]');
                        if (nameInput) {
                            nameInput.required = !isChecked;
                            if (isChecked) {
                                nameInput.value = '';
                            }
                        }
                    }
                    
                    if (phoneInputWrapper) {
                        phoneInputWrapper.style.display = isChecked ? 'none' : 'flex';
                        const phoneInput = phoneInputWrapper.querySelector('input[name="phone"]');
                        if (phoneInput) {
                            phoneInput.required = !isChecked;
                            if (isChecked) {
                                phoneInput.value = '';
                            }
                        }
                    }
                }
                
                // Обработчик изменения чекбокса
                contactDubbleCheckbox.addEventListener('change', toggleContactFields);
                
                // Инициализация при загрузке страницы
                toggleContactFields();
            }
        }
    })();

});