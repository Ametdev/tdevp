const fs = require('fs');
const path = require('path');

console.log('🔍 Парсинг сайта teplyj-dom-ulitsa-9-maja.clients.site...\n');

const htmlPath = path.join(__dirname, '..', 'site-content.html');
const outputPath = path.join(__dirname, '..', 'parsed-data.json');

if (!fs.existsSync(htmlPath)) {
  console.error('❌ Файл site-content.html не найден');
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, 'utf-8');

// Извлечение данных
const data = {
  title: '',
  description: '',
  phone: '',
  address: '',
  services: [],
  contacts: {},
  parsedAt: new Date().toISOString()
};

// Извлечение title
const titleMatch = html.match(/<title>(.*?)<\/title>/);
if (titleMatch) {
  data.title = titleMatch[1];
  console.log('✓ Название:', data.title);
}

// Извлечение телефона
const phoneMatches = html.match(/\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}/g);
if (phoneMatches && phoneMatches.length > 0) {
  data.phone = phoneMatches[0];
  console.log('✓ Телефон:', data.phone);
}

// Извлечение адреса
const addressMatch = html.match(/Евпатория[^<]*/i);
if (addressMatch) {
  data.address = addressMatch[0].trim();
  console.log('✓ Адрес:', data.address);
}

// Извлечение описания услуг из текста
const servicePatterns = [
  /Цельностеклянные перегородки[^\.]*\./gi,
  /душевые кабины[^\.]*\./gi,
  /ограждения[^\.]*\./gi,
  /стеклянные двери[^\.]*\./gi,
  /Мягкие окна[^\.]*\./gi,
  /Сетки плиссе[^\.]*\./gi,
  /Подоконники[^\.]*\./gi,
  /Кондиционеры[^\.]*\./gi,
  /жалюзи[^\.]*\./gi,
  /металлопластиковые конструкции[^\.]*\./gi,
  /межкомнатных дверей[^\.]*\./gi,
  /входных дверей[^\.]*\./gi
];

const foundServices = new Set();
servicePatterns.forEach(pattern => {
  const matches = html.match(pattern);
  if (matches) {
    matches.forEach(match => {
      const cleaned = match.replace(/<[^>]*>/g, '').trim();
      if (cleaned.length > 10) {
        foundServices.add(cleaned);
      }
    });
  }
});

data.services = Array.from(foundServices);
console.log(`✓ Найдено услуг: ${data.services.length}`);

// Извлечение ссылок на соцсети
const telegramMatch = html.match(/https:\/\/t\.me\/[^\s"']*/);
if (telegramMatch) {
  data.contacts.telegram = telegramMatch[0];
  console.log('✓ Telegram:', data.contacts.telegram);
}

const whatsappMatch = html.match(/https:\/\/wa\.me\/[^\s"']*/);
if (whatsappMatch) {
  data.contacts.whatsapp = whatsappMatch[0];
  console.log('✓ WhatsApp:', data.contacts.whatsapp);
}

// Сохранение результата
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');
console.log('\n✅ Данные сохранены в parsed-data.json');
console.log(`📊 Извлечено: ${data.services.length} услуг, контакты, телефон\n`);
