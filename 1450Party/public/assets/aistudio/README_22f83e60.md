# 1450 Party

Yenilənmiş oyun paketi: telefon üçün tam yenidən işlənmiş yatay ekran, asan idarəetmə və sadələşdirilmiş xəritələr.

## Telefon idarəetməsi (VS döyüş)

Hər oyunçu üçün 4 düymə var: **◀ ▶** (hərəkət), **TULLAN**, **HÜCUM**.

- Hücum düyməsini basılı saxla: təkrar vurur və ən yaxın düşmənə avtomatik nişan alır.
- Nazik platformalara aşağıdan tullanıb üstünə çıxmaq olur. Divara söykənəndə oyunçu özü sıçrayır.
- Aşağı düşmək üçün TULLAN düyməsini aşağı sürüşdür.
- Rəng seçimi yalnız **Mağazada**-dır (hər oyunçu üçün ayrıca tab).
- Yeni fayllar: `mobile.css`, `mobile.js`.

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
- `mobile.js`, `mobile.css` — telefon idarəetməsi və yatay ekran üslubları
- `game.js`, `fight.js`, `spacebg.js` — oyun məntiqi və qrafika
- `sw.js`, `manifest.json` — PWA və oflayn keş
- `icon-192.png`, `icon-512.png` — tətbiq nişanları
- `background-music.mp3`, `battle-music.mp3` — oyun musiqiləri
