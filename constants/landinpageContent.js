import { title } from "process";

const landingPageContent = {
  en: [
    {
      HeroSection: {
        title: "Iftin Hotel Hobyo",
        description:
          "The perfect balance of luxury, comfort, and value are Iftin Hotel. Your home away from home.",
      },

      AboutSection: {
        title: "Welcome to Iftin Hotel",
        description:
          "Nestled in the heart of the city, Iftin Hotel offers a perfect blend of elegance, comfort, and exceptional service. Whether you're traveling for business or leisure, our dedicated staff is committed to making your stay memorable.",

        location: {
          title: "Prime Location",
          description:
            "Located in the heart of the city, Iftin Hotel is just a stone's throw away from major attractions, shopping districts, and business centers. Enjoy easy access to everything the city has to offer.",
        },
        experience: {
          title: "Luxury Experience",
          description:
            "Indulge in our luxurious accommodations, designed with your comfort in mind. Each room is equipped with modern amenities, plush bedding, and stunning views to ensure a restful stay.",
        },
        dining: {
          title: "Exquisite Dining",
          description:
            "Savor a culinary journey at our on-site restaurant, where our talented chefs create delectable dishes using the finest ingredients. Enjoy a variety of cuisines in a warm and inviting atmosphere.",
        },
      },
      roomsSection: {
        title: "Exceptional Accommodations for Every Need",
        description:
          "From cozy rooms to luxurious suites, we offer a variety of accommodations to make your stay perfect, no matter the occasion.",
        rooms: [
          {
            img: "imgs/single.jpg",
            title: "Single Room",
            description:
              "Our Single Rooms are perfect for solo travelers, offering a comfortable bed, modern amenities, and a peaceful atmosphere for relaxation.",
          },
          {
             img: "imgs/double.jpg",
            title: "Double Room",
            description:
              "Ideal for couples or friends, our Double Rooms feature two comfortable beds, stylish decor, and all the amenities you need for a pleasant stay.",
          },
          {
            img: "imgs/family.jpg",
            title: "Family Room",
            description:
              "Suitable for families, our Family Rooms offer a cozy and spacious layout, ample space for everyone, and a warm and inviting atmosphere.",
          }
        ],
      },

      HotelAmenities: {
        title: "Hotel Amenities",
        description:
          "Enjoy our wide range of premium amenities designed for your comfort and convenience.",
        amenities: [
          {
            title: "Free Wi-Fi",
            icon: "/imgs/wifi.svg",
            description:
              "Stay connected with complimentary high-speed Wi-Fi available throughout the hotel.",
          },
          {
            title: "24/7 Room Service",
            icon: "/imgs/24w.svg",
            description:
              "Enjoy delicious meals and snacks delivered to your room at any time of the day or night.",
          },
          {
            title: "Hall",
            icon: "/imgs/love.svg",
            description:
              "Host your events in our spacious and well-equipped hall, perfect for conferences, weddings, and gatherings.",
          },
        ],
      },

      HotelGallery: {
        title: "Hotel Gallery",
        description:
          "Explore our stunning hotel through our gallery, showcasing the elegance and beauty of Iftin Hotel.",
      },

      Testimonials: {
        title: "What Our Guests Say",
        description:
          "Don't just take our word for it. Hear from our satisfied guests about their experiences at Iftin Hotel.",
        testimonial: [
          {
            name: "John Doe",
            review:
              "I had an amazing stay at Iftin Hotel! The staff was incredibly friendly, and the room was beautiful. Highly recommend!",
          },
          {
            name: "Jane Smith",
            review:
              "The location is perfect, and the amenities are top-notch. I will definitely be coming back!",
          },
          {
            name: "Jane Smith",
            review:
              "The location is perfect, and the amenities are top-notch. I will definitely be coming back!",
          },
        ],
      },

      ContactUs: {
        title: "Get in Touch",
        description:
          "Have questions or need assistance? Contact us today, and our team will be happy to help.",
        address: "123 Hotel Street, City Center, Country",
        phone: "+1 (555) 123-4567",
        email: "info@iftinhotel.com",
      },
    },
  ],
  so: [
    {
      HeroSection: {
        title: "Hoteelka Iftin Hobyo",
        description:
          "Isku dheelitirnaan qumman oo raaxo, raaxo iyo qiimo leh. Hoteelka Iftin waa gurigaaga labaad.",
      },
      AboutSection: {
        title: "Ku soo dhawoow Hoteelka Iftin",
        description:
          "Waxaan ku yaallaa bartamaha magaalada Hobyo, Hoteelka Iftin wuxuu bixiya raaxo, adeeg heersare ah, iyo degenaan cajiib ah. Meel ku habboon safarka shaqada ama nasashada.",
        location: {
          title: "Meel Istiraatiiji ah",
          description:
            "Waxaan ku dhowahay meelaha muhiimka ah ee magaalada sida suuqyada, ganacsiyada, iyo goobaha dalxiiska. Hel marin fudud oo deg deg ah.",
        },
        experience: {
          title: "Waayo-aragnimo Raaxo Leh",
          description:
            "Qolalkayagu waxay leeyihiin agab casri ah, sariiro raaxo leh, iyo muuqaal qurxoon si aad ugu raaxaysato nasasho dhamaystiran.",
        },
        dining: {
          title: "Cunto Heer Sare ah",
          description:
            "Ku raaxayso cuntooyinka kala duwan ee karisay kooxdeena khibradda leh, adigoo fadhiga goob diirran oo soo dhawayn leh.",
        },
      },
      roomsSection: {
        title: "Qolal Ku Habboon Baahidaada",
        description:
          "Laga bilaabo qolalka keli ah ilaa qolalka raaxada leh, waxaan bixinaa xulashooyin kala duwan si loo daboolo baahidaada.",
        rooms: [
          {
            img: "imgs/single.jpg",
            title: "Qolka Keliya",
            description:
              "Qolalkan waxaa loogu talagalay qof socdaal ah oo keligii ah, waxayna bixiyaan raaxo iyo degganaansho.",
          },
          {
            img: "imgs/double.jpg",
            title: "Qolka Laba Qof",
            description:
              "Kuwa lammaanaha ah ama saaxiibada, qolalkan waxay bixiyaan laba sariir, agab casri ah, iyo muuqaal qurux badan.",
          },
          {
            img: "imgs/family.jpg",
            title: "Qolka Qoysaka ",
            description:
              "Ku raaxayso qolalkayaga Suurtagal ee quruxda badan, kuwaas oo leh ballaar qurux badan, sariiro qurux badan, iyo baranda gaar ah oo ku siinaya xasilooni iyo nabadgelyo.",
          },
        ],
      },
      HotelAmenities: {
        title: "Adeegyada Hoteelka",
        description:
          "Ka faa'iidayso adeegyada raaxada leh ee loogu talagalay inaad ku raaxaysato booqashadaada.",
        amenities: [
          {
            title: "Wi-Fi Bilaash ah",
            description:
              "Ku xirmo internet deg deg ah meel kasta oo hoteelka ka mid ah.",
            icon: "/imgs/wifi.svg",
          },
          {
            title: "Adeegga Qolka 24/7",
            description:
              "Dalbo cunto iyo cabitaan wakhti kasta oo aad rabto, maalmo iyo habeen.",
              icon: "/imgs/24w.svg",
          },
          {
            title: "Hoolka Shirarka & Aroosyada",
            description:
              "Ku qabso xafladahaaga iyo shirarkaaga hoolkayaga ballaaran ee casriga ah.",
              icon: "/imgs/love.svg"
          },
        ],
      },
      HotelGallery: {
        title: "Sawirrada Hoteelka",
        description:
          "Daawo quruxda Hoteelka Iftin adigoo ka dhex arkaya gallery-ga sawirrada.",
      },
      Testimonials: {
        title: "Waxa ay martidayadu ka sheegaan",
        description:
          "Akhriso fikirka martidayada si aad u ogaato khibradooda ay nala yeesheen.",
        testimonial: [
          {
            name: "John Doe",
            review:
              "Waxaan ku raaxaystay joogitaanka Hoteelka Iftin! Shaqaaluhu aad buu u naxariis badan yahay, qolkuna wuxuu ahaa mid qurux badan.",
          },
          {
            name: "Jane Smith",
            review:
              "Meesha aad bay ugu habboon tahay, adeegyaduna waa heer sare. Mar kale ayaan iman doonaa!",
          },
          {
            name: "Jane Smith",
            review:
              "Meesha aad bay ugu habboon tahay, adeegyaduna waa heer sare. Mar kale ayaan iman doonaa!",
          },
        ],
      },
      ContactUs: {
        title: "Nala Soo Xiriir",
        description:
          "Su'aalo ama caawimaad? Nala soo xiriir maanta, waxaan diyaar u nahay inaan ku caawinno.",
        address: "123 Hotel Street, City Center, Country",
        phone: "+1 (555) 123-4567",
        email: "info@iftinhotel.com",
      },
    },
]   
}

export default landingPageContent;