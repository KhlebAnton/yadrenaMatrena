// Инициализация после загрузки DOM и всех скриптов
document.addEventListener('DOMContentLoaded', function () {
    if (typeof THREE === 'undefined') {
        loadThreeJS()
            .then(initAll)
            .catch(error => {
                console.error('Failed to load Three.js:', error);
                // Можно добавить fallback или сообщение об ошибке
            });
    } else {
        initAll();
    }
});

// Функция для загрузки Three.js
function loadThreeJS() {
    return new Promise((resolve) => {
        const scripts = [
            'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js',
            'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js',
            'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/DRACOLoader.js'
        ];

        function loadScript(index) {
            if (index >= scripts.length) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = scripts[index];
            script.onload = () => loadScript(index + 1);
            script.onerror = () => {
                console.error(`Failed to load script: ${scripts[index]}`);
                loadScript(index + 1); // Продолжаем даже при ошибке
            };
            document.head.appendChild(script);
        }

        loadScript(0);
    });
}

// Глобальные переменные для управления сценами
const modelScenes = new Map();

// Инициализация всего
function initAll() {
    initColorTabs();
    initStationTabs();
    initVisibleSwipers();
}

// Инициализация цветовых табов
function initColorTabs() {
    const colorItems = document.querySelectorAll('.model_color-item');

    colorItems.forEach(item => {
        item.addEventListener('click', function () {
            const color = this.getAttribute('data-model-color');

            // Удаляем активный класс у всех
            colorItems.forEach(i => i.classList.remove('is-active'));
            // Добавляем активный класс текущему
            this.classList.add('is-active');

            // Показываем соответствующие свайперы
            updateVisibleSwipers(color);
        });
    });
}

// Инициализация табов станций
function initStationTabs() {
    const stationTabs = document.querySelectorAll('.model-station-tab');

    stationTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const station = this.getAttribute('data-tab-station');

            // Удаляем активный класс у всех
            stationTabs.forEach(t => t.classList.remove('is-active'));
            // Добавляем активный класс текущему
            this.classList.add('is-active');

            // Показываем соответствующие свайперы
            updateVisibleSwipers(null, station);
        });
    });
}

// Обновление видимых свайперов
function updateVisibleSwipers(color = null, station = null) {
    // Получаем текущие активные табы, если параметры не переданы
    setTimeout(() => {
        if (color === null) {
            const activeColor = document.querySelector('.model_color-item.is-active');
            color = activeColor ? activeColor.getAttribute('data-model-color') : 'black';
        }

        if (station === null) {
            const activeStation = document.querySelector('.model-station-tab.is-active');
            station = activeStation ? activeStation.getAttribute('data-tab-station') : 'Станция Мини 2';
        }

        // Скрываем все свайперы
        document.querySelectorAll('.product_swiper-container').forEach(container => {
            container.style.display = 'none';
            stopAllVideos(container);
            // При скрытии останавливаем рендеринг для этого контейнера
            const swiperId = container.id;
            if (modelScenes.has(swiperId)) {
                const sceneData = modelScenes.get(swiperId);
                cancelAnimationFrame(sceneData.animationId);
            }
        });

        // Показываем только нужные
        const visibleSelector = `.product_swiper-container[data-model-color="${color}"][data-tab-station="${station}"]`;
        const visibleContainers = document.querySelectorAll(visibleSelector);

        visibleContainers.forEach(container => {
            // Генерируем уникальный ID для контейнера, если его нет
            if (!container.id) {
                container.id = 'swiper-' + Math.random().toString(36).substr(2, 9);
            }

            container.style.display = '';

            // Если свайпер еще не инициализирован, инициализируем его
            if (!container.hasAttribute('data-swiper-initialized')) {
                initProductSwiper(container);
                container.setAttribute('data-swiper-initialized', 'true');
            } else {
                // Если свайпер уже инициализирован, возобновляем рендеринг
                const swiperId = container.id;
                if (modelScenes.has(swiperId)) {
                    const sceneData = modelScenes.get(swiperId);
                    sceneData.animationId = requestAnimationFrame(sceneData.animate);

                    // Восстанавливаем canvas в DOM
                    const modelContainer = container.querySelector('.model-container');
                    if (modelContainer) {
                        const existingCanvas = modelContainer.querySelector('.model-viewer');
                        if (existingCanvas) {
                            existingCanvas.replaceWith(sceneData.canvas);
                        } else {
                            modelContainer.appendChild(sceneData.canvas);
                        }
                    }
                }
            }
        });
    }, 100);

}

// Инициализация видимых свайперов при загрузке
function initVisibleSwipers() {
    updateVisibleSwipers();
}

// Инициализация одного продукта-свайпера
function initProductSwiper(container) {
    // Сначала инициализируем превью
    const previewSwiper = new Swiper(container.querySelector('.product-swiper__preview'), {
        spaceBetween: 10,
        slidesPerView: 'auto',
        direction: 'horizontal', // По умолчанию вертикальный
        navigation: {
            nextEl: container.querySelector('.swiper__preview-button-next'),
            prevEl: container.querySelector('.swiper__preview-button-prev'),
        },
        breakpoints: {
            // При ширине экрана меньше 1350px
            1350: {
                direction: 'vertical', // Меняем на горизонтальный

            }
        }
    });

    // Затем основной свайпер
    const mainSwiper = new Swiper(container.querySelector('.product-swiper__main'), {
        spaceBetween: 10,
        navigation: {
            nextEl: container.querySelector('.swiper__main-button-next'),
            prevEl: container.querySelector('.swiper__main-button-prev'),
        },
        thumbs: {
            swiper: previewSwiper
        },
        simulateTouch: false,
    touchRatio: 0, // полностью отключает реакцию на касания
    noSwiping: true, // предотвращает свайп
    preventInteractionOnTransition: true
    });

    // Обработка 3D моделей
    mainSwiper.on('slideChange', function () {
        const activeSlide = this.slides[this.activeIndex];
        const modelContainer = activeSlide.querySelector('.model-container');

        if (modelContainer) {
            const modelPath = modelContainer.getAttribute('data-object');
            showModel(modelPath, modelContainer, container.id);
        }
    });

    // Инициализация первой модели, если есть
    const firstModel = container.querySelector('.model-container');
    if (firstModel) {
        const modelPath = firstModel.getAttribute('data-object');
        showModel(modelPath, firstModel, container.id);
    }

    // Обработка видео
    const videoSlides = container.querySelectorAll('.swiper-slide__main-video');
    videoSlides.forEach(slide => {
        const video = slide.querySelector('video');
        const btn = slide.querySelector('.video_btn');

        btn.addEventListener('click', () => {
            video.play();
            btn.style.display = 'none';
        });

        video.addEventListener('click', videoPause);
        video.addEventListener('ended', videoStop);

        function videoPause() {
            video.pause();
            btn.style.display = '';
        }

        function videoStop() {
            video.pause();
            btn.style.display = '';
            video.currentTime = 0;
        }
    });

    // Остановка видео при смене слайда
    mainSwiper.on('slideChange', function () {
        stopAllVideos(container);
    });
}

// Остановка всех видео в контейнере
function stopAllVideos(container) {
    container.querySelectorAll('video').forEach(video => {
        video.pause();
        video.currentTime = 0;
        const btn = video.closest('.swiper-slide').querySelector('.video_btn');
        if (btn) btn.style.display = '';
    });
}

// Показать модель
function showModel(modelPath, container, swiperId) {
    // Если модель уже загружена для этого свайпера, просто показываем ее
    if (modelScenes.has(swiperId)) {
        const sceneData = modelScenes.get(swiperId);
        if (sceneData.modelPath === modelPath) {
            // Просто активируем существующую сцену
            activateScene(sceneData, container);
            return;
        } else {
            // Очищаем предыдущую сцену
            cleanupScene(sceneData);
            modelScenes.delete(swiperId);
        }
    }

    // Загружаем новую модель
    initModelViewer(container, modelPath, swiperId);
}

// Активировать существующую сцену
function activateScene(sceneData, container) {
    const existingCanvas = container.querySelector('.model-viewer');
    if (existingCanvas) {
        existingCanvas.replaceWith(sceneData.canvas);
    } else {
        container.appendChild(sceneData.canvas);
    }
    sceneData.canvas.style.display = '';
    sceneData.resizeObserver.observe(container);

    // Возобновляем анимацию
    sceneData.animationId = requestAnimationFrame(sceneData.animate);
}

// Очистка сцены
function cleanupScene(sceneData) {
    if (sceneData.resizeObserver) {
        sceneData.resizeObserver.disconnect();
    }

    if (sceneData.renderer) {
        // Важно: сначала остановить анимацию, затем освободить ресурсы
        cancelAnimationFrame(sceneData.animationId);
        sceneData.renderer.dispose();
        sceneData.renderer.forceContextLoss();
        sceneData.renderer.context = null;
        sceneData.renderer.domElement = null;
    }

    // Очистка сцены и материалов
    if (sceneData.scene) {
        sceneData.scene.traverse(child => {
            if (child.material) {
                child.material.dispose();
            }
            if (child.geometry) {
                child.geometry.dispose();
            }
        });
        sceneData.scene.children = [];
    }

    // Удаление обработчиков событий
    const canvas = sceneData.canvas;
    if (canvas) {
        canvas.removeEventListener('mousedown', sceneData.onPointerDown);
        canvas.removeEventListener('touchstart', sceneData.onPointerDown);
    }
    window.removeEventListener('mouseup', sceneData.onPointerUp);
    window.removeEventListener('touchend', sceneData.onPointerUp);
    window.removeEventListener('mousemove', sceneData.onPointerMove);
    window.removeEventListener('touchmove', sceneData.onPointerMove);
}

// Инициализация просмотрщика модели
function initModelViewer(container, modelPath, swiperId) {
    // Проверяем наличие THREE и необходимых компонентов
    if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
        console.error('Three.js or its components are not loaded');
        setTimeout(() => initModelViewer(container, modelPath, swiperId), 100);
        return;
    }
    const canvas = container.querySelector('.model-viewer');
    canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost');
        if (modelScenes.has(swiperId)) {
            const sceneData = modelScenes.get(swiperId);
            cancelAnimationFrame(sceneData.animationId);
        }
    });

    canvas.addEventListener('webglcontextrestored', () => {
        console.log('WebGL context restored');
        if (modelScenes.has(swiperId)) {
            const sceneData = modelScenes.get(swiperId);
            sceneData.animationId = requestAnimationFrame(sceneData.animate);
        }
    });
    const loadingElement = container.querySelector('.loading');
    const errorElement = container.querySelector('.error');

    // Создаем новую сцену
    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.setPixelRatio(window.devicePixelRatio);

    function updateRendererSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    updateRendererSize();

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Управление вращением
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let model = null;

    // Обработчики событий
    const onPointerDown = (event) => {
        event.stopPropagation();
        isDragging = true;
        previousMousePosition = {
            x: event.clientX || event.touches[0].clientX,
            y: event.clientY || event.touches[0].clientY
        };
    };

    const onPointerUp = () => {
        isDragging = false;
    };

    const onPointerMove = (event) => {
        if (!isDragging || !model) return;

        event.preventDefault();
        event.stopPropagation();

        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);

        if (clientX === undefined || clientY === undefined) return;

        const deltaMove = {
            x: clientX - previousMousePosition.x,
            y: clientY - previousMousePosition.y
        };

        model.rotation.y += deltaMove.x * 0.005;
        model.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: clientX, y: clientY };
    };

    // Добавляем обработчики
    canvas.addEventListener('mousedown', onPointerDown, { passive: false });
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });

    // Ресайз
    const resizeObserver = new ResizeObserver(() => {
        updateRendererSize();
        if (model) fitCameraToModel();
    });
    resizeObserver.observe(container);

    // Центрирование камеры
    function fitCameraToModel() {
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 100);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2)) * 1.1;

        camera.position.z = cameraZ;
        camera.lookAt(center);
    }

    // Показать/скрыть загрузку
    function showLoading(show) {
        loadingElement.style.display = show ? 'block' : 'none';
    }

    function showError(message) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Загрузка модели
    function loadModel() {
        showLoading(true);
        errorElement.style.display = 'none';

        const loader = new THREE.GLTFLoader();
        const dracoLoader = new THREE.DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
        loader.setDRACOLoader(dracoLoader);

        loader.load(
            modelPath,
            (gltf) => {
                if (model) scene.remove(model);

                model = gltf.scene;

                // Настройка материалов
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Центрирование и масштабирование
                const box = new THREE.Box3().setFromObject(model);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.0 / maxDim;
                model.scale.set(scale, scale, scale);

                box.setFromObject(model);
                const newCenter = box.getCenter(new THREE.Vector3());
                model.position.x -= newCenter.x;
                model.position.y -= newCenter.y;
                model.position.z -= newCenter.z;

                scene.add(model);
                fitCameraToModel();
                showLoading(false);

                // Функция анимации
                function animate() {
                    sceneData.animationId = requestAnimationFrame(animate);
                    renderer.render(scene, camera);
                }

                // Сохраняем сцену для повторного использования
                const sceneData = {
                    scene,
                    camera,
                    renderer,
                    model,
                    canvas: canvas,
                    resizeObserver,
                    onPointerDown,
                    onPointerUp,
                    onPointerMove,
                    animationId: null,
                    modelPath,
                    animate
                };

                // Запускаем анимацию
                sceneData.animationId = requestAnimationFrame(animate);

                modelScenes.set(swiperId, sceneData);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                showLoading(false);
                showError('Error loading model. Please check console for details.');
            }
        );
    }

    // Запуск загрузки модели
    loadModel();
}