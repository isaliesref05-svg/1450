# 1450 Party

Yenilənmiş oyun paketi: daha rahat mağaza, döyüşçü rəng palitrası, yenilənmiş zirehli personaj görünüşü və mobil yatay ekran düzülüşü.

## Başlatmaq

Faylları bir qovluğa çıxarın və həmin qovluqda sadə HTTP server başladın:

```sh
python3 -m http.server 8000
```

Sonra brauzerdə `http://localhost:8000` ünvanını açın. Telefonda oyunu üfüqi vəziyyətdə istifadə edin; quraşdırılmış PWA üçün manifest yatay istiqaməti seçir.

## Google ilə giriş

Google girişi istəyə bağlıdır. Standart paketdə hesab açarı yoxdur, qonaq rejimi işləyir. Girişi aktivləşdirmək üçün `firebase-config.example.js` faylını `firebase-config.js` adı ilə kopyalayıb öz Firebase Web tətbiqinizin ayarlarını daxil edin. `firebase-config.js` paylaşılmamalı və açıq repozitoriyaya yüklənməməlidir.

## Fayllar

- `index.html` — menyu, mağaza və oyun interfeysi
- `game.js`, `fight.js`, `spacebg.js` — oyun məntiqi və qrafika
- `sw.js`, `manifest.json` — PWA və oflayn keş
- `icon-192.png`, `icon-512.png` — tətbiq nişanları
- `background-music.mp3`, `battle-music.mp3` — oyun musiqiləri
