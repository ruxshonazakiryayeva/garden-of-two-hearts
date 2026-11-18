CREATE TABLE public.invitation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  template text NOT NULL DEFAULT 'sacred-garden',
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  media jsonb NOT NULL DEFAULT '{}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.invitation TO anon, authenticated;
GRANT ALL ON public.invitation TO service_role;
ALTER TABLE public.invitation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read invitations" ON public.invitation FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_slug text NOT NULL,
  name text NOT NULL,
  attending boolean NOT NULL,
  guests_count integer NOT NULL DEFAULT 1,
  song text,
  children_info text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.rsvps TO anon, authenticated;
GRANT ALL ON public.rsvps TO service_role;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit rsvps" ON public.rsvps FOR INSERT TO anon, authenticated
WITH CHECK (
  char_length(name) BETWEEN 1 AND 200
  AND guests_count BETWEEN 0 AND 50
  AND coalesce(char_length(song),0) <= 300
  AND coalesce(char_length(children_info),0) <= 1000
  AND EXISTS (SELECT 1 FROM public.invitation i WHERE i.slug = invitation_slug)
);

CREATE TABLE public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_login_attempts TO service_role;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE INDEX admin_login_attempts_ip_idx ON public.admin_login_attempts(ip, created_at);

INSERT INTO public.invitation (slug, content, media, settings) VALUES (
'sacred-garden',
$json${
  "wedding_date": "2026-09-27T17:00:00",
  "map_url": "https://www.google.com/maps?q=Islamic+Center+of+Melville,+118+Old+East+Neck+Road,+Melville,+NY+11747&output=embed",
  "languages": [{"code":"uz","label":"UZ"},{"code":"ru","label":"RU"},{"code":"en","label":"EN"}],
  "schedule": [
    {"time":{"uz":"17:00","ru":"17:00","en":"5 PM"},"title":{"uz":"Mehmonlar kelishi","ru":"Сбор гостей","en":"Guest Arrival"}},
    {"time":{"uz":"18:00","ru":"18:00","en":"6 PM"},"title":{"uz":"Nikoh marosimi","ru":"Церемония никах","en":"Nikkah Ceremony"}},
    {"time":{"uz":"19:00","ru":"19:00","en":"7 PM"},"title":{"uz":"Kokteyl soati","ru":"Час коктейлей","en":"Mocktail Hour"}},
    {"time":{"uz":"20:00","ru":"20:00","en":"8 PM"},"title":{"uz":"Kechki ziyofat","ru":"Ужин","en":"Dinner"}},
    {"time":{"uz":"21:00","ru":"21:00","en":"9 PM"},"title":{"uz":"Raqslar","ru":"Танцы","en":"Dance"}}
  ],
  "texts": {
    "meta_title": {"uz":"Zohan & Rose — Toʻy kuni","ru":"Зохан и Роуз — День свадьбы","en":"Zohan & Rose — Wedding Day"},
    "meta_description": {"uz":"Zohan va Rose toʻyiga taklifnoma","ru":"Приглашение на свадьбу Зохана и Роуз","en":"You are invited to the wedding of Zohan & Rose"},
    "groom": {"uz":"Zohan","ru":"Зохан","en":"Zohan"},
    "bride": {"uz":"Rose","ru":"Роуз","en":"Rose"},
    "ampersand": {"uz":"&","ru":"&","en":"&"},
    "wedding_day": {"uz":"Toʻy kuni","ru":"День свадьбы","en":"Wedding Day"},
    "date_display": {"uz":"27.09.26","ru":"27.09.26","en":"27.09.26"},
    "tap_to_open": {"uz":"Ochish uchun bosing","ru":"Нажмите, чтобы открыть","en":"Tap to open"},
    "poem_line1": {"uz":"Ikki qalb","ru":"Две души","en":"Two Souls"},
    "poem_line2": {"uz":"Yagona taqdir","ru":"Одна судьба","en":"One destiny"},
    "poem_line3": {"uz":"Alloh bitgan umrbod hayot","ru":"Жизнь, написанная Аллахом","en":"A Lifetime written by Allah"},
    "intro_title": {"uz":"Aziz doʻstlar va yaqinlar","ru":"Дорогие друзья и близкие","en":"Dear Friends and Family"},
    "intro_text": {"uz":"Abadiy hayotimizni boshlar ekanmiz, sizni sevgi, quvonch, duolar va unutilmas xotiralarga toʻla oqshomda biz bilan birga boʻlishga taklif qilamiz.","ru":"Приглашаем вас разделить с нами вечер любви, смеха, дуа и незабываемых воспоминаний, когда мы начинаем нашу вечность.","en":"Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever."},
    "scroll_hint": {"uz":"Pastga suring","ru":"Листайте вниз","en":"Scroll down"},
    "countdown_title": {"uz":"Bayram boshlanishiga","ru":"До торжества осталось","en":"The Celebration Begins In"},
    "days": {"uz":"Kun","ru":"Дней","en":"Days"},
    "hours": {"uz":"Soat","ru":"Часов","en":"Hours"},
    "minutes": {"uz":"Daqiqa","ru":"Минут","en":"Minutes"},
    "seconds": {"uz":"Soniya","ru":"Секунд","en":"Seconds"},
    "schedule_title": {"uz":"Tadbirlar dasturi","ru":"Программа вечера","en":"Schedule of Events"},
    "location_title": {"uz":"Manzil","ru":"Место проведения","en":"Location"},
    "venue_name": {"uz":"Islamic Center of Melville","ru":"Исламский центр Мелвилла","en":"Islamic Center of Melville"},
    "address": {"uz":"118 Old East Neck Road, Melville, NY 11747","ru":"118 Old East Neck Road, Melville, NY 11747","en":"118 Old East Neck Road, Melville, NY 11747"},
    "gift_title": {"uz":"Sovgʻa boʻyicha istak","ru":"Пожелания по подаркам","en":"Gift Preference"},
    "gift_text": {"uz":"Iltimos, qutidagi sovgʻalar olib kelmang.","ru":"Пожалуйста, без подарков в коробках.","en":"Kindly, no boxed gifts please."},
    "dress_title": {"uz":"Kiyinish uslubi","ru":"Дресс-код","en":"Dress Code"},
    "dress_text": {"uz":"Mehmonlardan toʻq qizil va bordo rangdagi liboslardan saqlanishlarini soʻraymiz.","ru":"Просим гостей воздержаться от тёмно-красных и бордовых нарядов.","en":"We kindly ask guests to avoid deep red and maroon attire for the celebration."},
    "rsvp_title": {"uz":"Ishtirokingizni tasdiqlang","ru":"Подтвердите присутствие","en":"Confirm Your Attendance"},
    "rsvp_button": {"uz":"Javob berish","ru":"Ответить","en":"RSVP"},
    "rsvp_deadline_prefix": {"uz":"Iltimos, shu sanagacha javob bering:","ru":"Пожалуйста, ответьте до","en":"Please RSVP before"},
    "rsvp_deadline": {"uz":"9-avgust","ru":"9 августа","en":"August 09"},
    "field_name": {"uz":"Ismingiz","ru":"Ваше имя","en":"Your name"},
    "field_attending": {"uz":"Tashrif buyurasizmi?","ru":"Вы придёте?","en":"Will you be attending?"},
    "attending_yes": {"uz":"Mamnuniyat bilan qatnashaman","ru":"С удовольствием приду","en":"Accepts with pleasure"},
    "attending_no": {"uz":"Afsuski, kela olmayman","ru":"К сожалению, не смогу","en":"Declines with regret"},
    "field_guests": {"uz":"Mehmonlar soni","ru":"Количество гостей","en":"Number of guests"},
    "field_song": {"uz":"Sizni raqsga tushiradigan qoʻshiq","ru":"Песня, под которую вы танцуете","en":"A song that gets you dancing"},
    "field_children": {"uz":"Bolalar (ismlari va yoshi)","ru":"Дети (имена и возраст)","en":"Children attending (names and ages)"},
    "submit": {"uz":"Yuborish","ru":"Отправить","en":"Submit"},
    "rsvp_success": {"uz":"Rahmat! Javobingiz qabul qilindi.","ru":"Спасибо! Ваш ответ получен.","en":"Thank you! Your response has been received."},
    "rsvp_error": {"uz":"Xatolik yuz berdi, qayta urinib koʻring.","ru":"Произошла ошибка, попробуйте ещё раз.","en":"Something went wrong, please try again."},
    "footer_text": {"uz":"Sizni kutib qolamiz!","ru":"Будем рады вас видеть!","en":"Hope to see you there!"},
    "not_found_title": {"uz":"Taklifnoma topilmadi","ru":"Приглашение не найдено","en":"Invitation not found"},
    "not_found_text": {"uz":"Bu havola boʻyicha taklifnoma mavjud emas.","ru":"По этой ссылке приглашения нет.","en":"There is no invitation at this link."}
  }
}$json$::jsonb,
$json${
  "music_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  "hero_video_url": "",
  "hero_image": "/images/hero.jpg",
  "cover_image": "/images/envelope.jpg",
  "decor_image": "/images/rose-decor.png",
  "footer_image": "/images/footer.jpg"
}$json$::jsonb,
$json${
  "default_language": "uz",
  "colors": {"background":"#faf6ee","foreground":"#3d4a3a","primary":"#7d8f6e","accent":"#b89b5e"},
  "fonts": {"display":"Cormorant Garamond","body":"Jost"},
  "section_order": ["opening","hero","countdown","schedule","location","details","rsvp","footer"],
  "sections_enabled": {"opening":true,"hero":true,"countdown":true,"schedule":true,"location":true,"details":true,"rsvp":true,"footer":true}
}$json$::jsonb
);
