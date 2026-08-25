Yüksek performanslı, ölçeklenebilir ve asenkron çalışan bir medya işleme servisidir. Node.js ve FFmpeg kullanılarak geliştirilen bu proje, sunucu kaynaklarını optimize etmek amacıyla kendi içinde bir Kuyruk (Queue) Mimarisi barındırır.

Mimari tasarımda Açık-Kapalı Prensibi (Open-Closed Principle) benimsenmiş olup, yeni medya dönüştürme formatları tamamen modüler bir yapıda sisteme entegre edilebilir.

🌟 Temel Özellikler
In-Memory Queue Yönetimi: Aynı anda gelen çoklu istekleri sıraya alarak sunucuda CPU ve RAM darboğazlarını (bottleneck) engeller.

Modüler Dönüşüm Mimarisi: MP4, WebM, AVI gibi standart dönüşümlerin yanı sıra; çözünürlük optimizasyonu (720p), süre kesimi ve görsel damga (watermark) gibi veri manipülasyonlarını içerir.

Güvenlik Katmanı: Sadece geçerli video MIME tiplerine izin verilerek sunucuya zararlı dosya yüklenmesi engellenmiştir.

Otomatik Garbage Collection: Zamanlanmış görevler (node-cron) sayesinde eski dosyalar ve veritabanı kayıtları düzenli olarak silinerek disk yönetimi optimize edilir.

Konteynerizasyon: Uygulama ve veritabanı, birbirine bağlı izole bir sanal ağ üzerinde çalışmak üzere Dockerize edilmiştir.

🛠️ Teknolojiler
Backend: Node.js, Express.js

Medya İşleme Motoru: FFmpeg, fluent-ffmpeg

Veritabanı: MySQL (Connection Pooling altyapısı ile)

DevOps ve Dağıtım: Docker, Docker Compose

🚀 Hızlı Başlangıç
Sistemi herhangi bir sunucuda (veya yerel bilgisayarınızda) ayağa kaldırmak için sadece Docker ortamına sahip olmanız yeterlidir.

Projeyi bilgisayarınıza indirin ve klasörün içine girin:
git clone https://github.com/kullaniciadin/video-donusturucu.git
cd video-donusturucu

Tüm mimariyi arka planda çalıştırın:
docker-compose up -d

Uygulama anında yayına girecektir. Tarayıcınızdan http://localhost:3000 adresine giderek sistemi test edebilirsiniz.
