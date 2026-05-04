import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Валидация контента...\n');

const errors = [];
const warnings = [];

// Проверка products
const productsDir = path.join(__dirname, '..', 'src', 'content', 'products');
const reviewsDir = path.join(__dirname, '..', 'src', 'content', 'reviews');
const galleryDir = path.join(__dirname, '..', 'src', 'content', 'gallery');

const validCategories = [
  'Стеклянные конструкции',
  'Окна и защита',
  'Двери',
  'Подоконники',
  'Кондиционеры',
  'Жалюзи и шторы'
];

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');
  let currentKey = null;
  let currentArray = null;

  for (const line of lines) {
    // Проверка на элемент массива
    if (line.trim().startsWith('-') && currentKey) {
      if (!currentArray) {
        currentArray = [];
        frontmatter[currentKey] = currentArray;
      }
      const value = line.trim().substring(1).trim();
      currentArray.push(value);
    } else {
      // Обычное поле
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (value) {
          frontmatter[currentKey] = value.replace(/^["']|["']$/g, '');
          currentArray = null;
        } else {
          // Пустое значение - возможно начало массива
          currentArray = null;
        }
      }
    }
  }

  return frontmatter;
}

function validateProducts() {
  if (!fs.existsSync(productsDir)) {
    warnings.push({
      file: 'products/',
      message: 'Папка products не найдена',
      recommendation: 'Создайте папку src/content/products'
    });
    return;
  }

  const files = fs.readdirSync(productsDir).filter(f => f.endsWith('.md'));

  if (files.length === 0) {
    warnings.push({
      file: 'products/',
      message: 'Нет товаров в каталоге',
      recommendation: 'Добавьте файлы товаров в src/content/products'
    });
    return;
  }

  console.log(`📦 Проверка ${files.length} товаров...`);

  files.forEach(file => {
    const filePath = path.join(productsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      errors.push({
        file: `products/${file}`,
        message: 'Отсутствует frontmatter',
        recommendation: 'Добавьте frontmatter в начало файла между ---'
      });
      return;
    }

    // Проверка обязательных полей
    const requiredFields = ['title', 'description', 'price', 'category', 'image'];
    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        errors.push({
          file: `products/${file}`,
          message: `Отсутствует обязательное поле: ${field}`,
          recommendation: `Добавьте поле ${field} в frontmatter`
        });
      }
    });

    // Проверка категории
    if (frontmatter.category && !validCategories.includes(frontmatter.category)) {
      errors.push({
        file: `products/${file}`,
        message: `Некорректная категория: ${frontmatter.category}`,
        recommendation: `Используйте одну из категорий: ${validCategories.join(', ')}`
      });
    }

    // Проверка цены
    if (frontmatter.price) {
      const price = parseFloat(frontmatter.price);
      if (isNaN(price) || price <= 0) {
        errors.push({
          file: `products/${file}`,
          message: `Некорректное значение price: ${frontmatter.price}`,
          recommendation: 'Укажите положительное число'
        });
      }
    }

    // Проверка изображения (только предупреждение, т.к. изображения могут быть добавлены позже)
    if (frontmatter.image && !frontmatter.image.startsWith('http')) {
      const imagePath = path.join(__dirname, '..', 'public', frontmatter.image);
      if (!fs.existsSync(imagePath)) {
        warnings.push({
          file: `products/${file}`,
          message: `Файл изображения не найден: ${frontmatter.image}`,
          recommendation: 'Добавьте изображение или исправьте путь'
        });
      }
    }
  });
}

function validateReviews() {
  if (!fs.existsSync(reviewsDir)) {
    return; // Отзывы опциональны
  }

  const files = fs.readdirSync(reviewsDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) return;

  console.log(`⭐ Проверка ${files.length} отзывов...`);

  files.forEach(file => {
    const filePath = path.join(reviewsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      errors.push({
        file: `reviews/${file}`,
        message: 'Отсутствует frontmatter',
        recommendation: 'Добавьте frontmatter в начало файла'
      });
      return;
    }

    // Проверка обязательных полей
    const requiredFields = ['author', 'date', 'rating'];
    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        errors.push({
          file: `reviews/${file}`,
          message: `Отсутствует обязательное поле: ${field}`,
          recommendation: `Добавьте поле ${field} в frontmatter`
        });
      }
    });

    // Проверка рейтинга
    if (frontmatter.rating) {
      const rating = parseInt(frontmatter.rating);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        errors.push({
          file: `reviews/${file}`,
          message: `Некорректное значение rating: ${frontmatter.rating} (должно быть от 1 до 5)`,
          recommendation: 'Измените значение rating на число от 1 до 5'
        });
      }
    }
  });
}

function validateGallery() {
  if (!fs.existsSync(galleryDir)) {
    return; // Галерея опциональна
  }

  const files = fs.readdirSync(galleryDir).filter(f => f.endsWith('.md'));
  if (files.length === 0) return;

  console.log(`🖼️  Проверка ${files.length} проектов в галерее...`);

  files.forEach(file => {
    const filePath = path.join(galleryDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const frontmatter = extractFrontmatter(content);

    if (!frontmatter) {
      errors.push({
        file: `gallery/${file}`,
        message: 'Отсутствует frontmatter',
        recommendation: 'Добавьте frontmatter в начало файла'
      });
      return;
    }

    // Проверка обязательных полей
    const requiredFields = ['title', 'date', 'images'];
    requiredFields.forEach(field => {
      if (!frontmatter[field]) {
        errors.push({
          file: `gallery/${file}`,
          message: `Отсутствует обязательное поле: ${field}`,
          recommendation: `Добавьте поле ${field} в frontmatter`
        });
      }
    });
  });
}

// Запуск валидации
validateProducts();
validateReviews();
validateGallery();

// Запись результатов
const outputPath = path.join(__dirname, '..', 'content-validation-errors.txt');
let output = '=== ОШИБКИ ВАЛИДАЦИИ КОНТЕНТА ===\n';
output += `Дата проверки: ${new Date().toLocaleString('ru-RU')}\n\n`;

if (errors.length === 0 && warnings.length === 0) {
  output += '✅ Ошибок не найдено! Все файлы контента валидны.\n';
  console.log('\n✅ Валидация успешна! Ошибок не найдено.\n');
} else {
  if (errors.length > 0) {
    output += `Найдено ошибок: ${errors.length}\n\n`;
    errors.forEach(error => {
      output += `[ОШИБКА] ${error.file}\n`;
      output += `  - ${error.message}\n`;
      output += `  - Рекомендация: ${error.recommendation}\n\n`;
    });
  }

  if (warnings.length > 0) {
    output += `Найдено предупреждений: ${warnings.length}\n\n`;
    warnings.forEach(warning => {
      output += `[ПРЕДУПРЕЖДЕНИЕ] ${warning.file}\n`;
      output += `  - ${warning.message}\n`;
      output += `  - Рекомендация: ${warning.recommendation}\n\n`;
    });
  }

  fs.writeFileSync(outputPath, output, 'utf-8');

  console.log(`\n⚠️  Найдено проблем: ${errors.length} ошибок, ${warnings.length} предупреждений`);
  console.log(`📝 Детали записаны в: content-validation-errors.txt\n`);

  if (errors.length > 0) {
    console.log('❌ Обнаружены ошибки валидации. Проверьте файл content-validation-errors.txt\n');
  }
}

// Не блокируем сборку, только информируем
process.exit(0);
