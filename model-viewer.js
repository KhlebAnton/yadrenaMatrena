// Глобальные переменные для текущей сцены
let currentScene = null;
let currentRenderer = null;
let currentCamera = null;
let currentModel = null;
let currentContainer = null;

// Функция для очистки текущей сцены
function cleanupCurrentScene() {
    if (!currentScene) return;
    
    // Удаляем все объекты из сцены
    while(currentScene.children.length > 0) { 
        currentScene.remove(currentScene.children[0]); 
    }
    
    // Останавливаем анимацию
    if (currentRenderer) {
        currentRenderer.dispose();
    }
    
    currentScene = null;
    currentRenderer = null;
    currentCamera = null;
    currentModel = null;
}

// Основная функция для показа модели
function showModel(modelPath, containerSelector = '.model-container') {
    // Находим контейнер
    const container = document.querySelector(`${containerSelector}[data-object="${modelPath}"]`);
    if (!container) {
        console.error(`Container with data-object="${modelPath}" not found`);
        return;
    }
    
    // Очищаем предыдущую сцену
    cleanupCurrentScene();
    
    // Инициализируем новую сцену
    initModelViewer(container, modelPath);
}

// Инициализация просмотрщика модели
function initModelViewer(container, modelPath) {
    // Сохраняем ссылку на текущий контейнер
    currentContainer = container;
    
    // Элементы интерфейса
    const canvas = container.querySelector('.model-viewer');
    const loadingElement = container.querySelector('.loading');
    const errorElement = container.querySelector('.error');

    // Инициализация Three.js
    currentScene = new THREE.Scene();
    currentScene.background = new THREE.Color(0xeeeeee);

    currentCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    currentCamera.position.z = 5;

    currentRenderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    currentRenderer.outputEncoding = THREE.sRGBEncoding;
    currentRenderer.setPixelRatio(window.devicePixelRatio);
    updateRendererSize();

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    currentScene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    currentScene.add(directionalLight);

    // Управление вращением
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    // Обработчики событий
    const onPointerDown = (event) => {
        isDragging = true;
        const clientX = event.clientX || event.touches[0].clientX;
        const clientY = event.clientY || event.touches[0].clientY;
        previousMousePosition = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
        isDragging = false;
    };

    const onPointerMove = (event) => {
        if (!isDragging || !currentModel) return;

        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);

        if (clientX === undefined || clientY === undefined) return;

        const deltaMove = {
            x: clientX - previousMousePosition.x,
            y: clientY - previousMousePosition.y
        };

        currentModel.rotation.y += deltaMove.x * 0.01;
        currentModel.rotation.x += deltaMove.y * 0.01;

        previousMousePosition = { x: clientX, y: clientY };
    };

    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', onPointerDown, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: false });

    // Resize Observer
    const resizeObserver = new ResizeObserver(() => {
        updateRendererSize();
        if (currentModel) fitCameraToModel();
    });
    resizeObserver.observe(container);

    // Функции
    function updateRendererSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        currentRenderer.setSize(width, height, false);
        currentCamera.aspect = width / height;
        currentCamera.updateProjectionMatrix();
    }

    function fitCameraToModel() {
        if (!currentModel) return;

        const box = new THREE.Box3().setFromObject(currentModel);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = currentCamera.fov * (Math.PI / 100);
        let cameraZ = Math.abs(maxDim / Math.sin(fov / 2));

        // Добавляем небольшой отступ
        cameraZ *= 1.1;

        currentCamera.position.z = cameraZ;
        currentCamera.lookAt(center);
    }

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
                if (currentModel) currentScene.remove(currentModel);

                currentModel = gltf.scene;

                // Настройка материалов и теней
                currentModel.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Центрирование и масштабирование
                const box = new THREE.Box3().setFromObject(currentModel);
                const size = box.getSize(new THREE.Vector3());
                const center = box.getCenter(new THREE.Vector3());

                // Автоматическое масштабирование
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2.0 / maxDim;
                currentModel.scale.set(scale, scale, scale);

                // Обновляем позицию после масштабирования
                box.setFromObject(currentModel);
                const newCenter = box.getCenter(new THREE.Vector3());
                currentModel.position.x -= newCenter.x;
                currentModel.position.y -= newCenter.y;
                currentModel.position.z -= newCenter.z;

                currentScene.add(currentModel);
                fitCameraToModel();
                showLoading(false);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                showLoading(false);
                showError('Error loading model. Please check console for details.');
            }
        );
    }

    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        currentRenderer.render(currentScene, currentCamera);
    }

    // Начинаем загрузку и анимацию
    loadModel();
    animate();
}