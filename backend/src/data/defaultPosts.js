const defaultPosts = [
  {
    id: 1,
    title: "Getting Started with React and Supabase",
    title_az: "React və Supabase ilə Başlanğıc",
    slug: "getting-started-react-supabase",
    excerpt: "Learn how to build modern web applications using React.js and Supabase as your backend-as-a-service.",
    excerpt_az: "Backend-as-a-service kimi React.js və Supabase istifadə edərək müasir veb tətbiqlərin necə qurulacağını öyrənin.",
    content: `
      <p>Building modern web applications has never been easier. With React.js for the frontend and Supabase as your backend, you can create powerful, scalable applications in no time.</p>
      
      <h2>Why React + Supabase?</h2>
      <p>React provides a component-based architecture that makes building UIs intuitive and maintainable. Supabase offers a complete backend solution with authentication, database, and storage - all with a generous free tier.</p>
      
      <h2>Getting Started</h2>
      <p>First, create a new React project using Vite:</p>
      <pre><code>npm create vite@latest my-app -- --template react</code></pre>
      
      <p>Then install the Supabase client:</p>
      <pre><code>npm install @supabase/supabase-js</code></pre>
      
      <h2>Setting Up Supabase</h2>
      <p>Create a new project on supabase.com, then grab your project URL and anon key. Create a configuration file to initialize the client:</p>
      
      <pre><code>import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)</code></pre>
      
      <p>Now you're ready to start building! In the next post, we'll cover authentication and database operations.</p>
    `,
    content_az: `
      <p>Müasir veb tətbiqlər qurmaq heç vaxt bu qədər asan olmayıb. Frontend üçün React.js və backend üçün Supabase ilə güclü, miqyaslana bilən tətbiqləri qısa müddətdə yarada bilərsiniz.</p>
      
      <h2>Niyə React + Supabase?</h2>
      <p>React komponent əsaslı arxitektura təqdim edir ki, bu da UI qurmanı intuitiv və saxlanıla bilən edir. Supabase autentifikasiya, verilənlər bazası və saxlama ilə tam backend həlli təklif edir — hamısı geniş pulsuz tariflə.</p>
      
      <h2>Başlanğıc</h2>
      <p>Əvvəlcə Vite ilə yeni React layihəsi yaradın:</p>
      <pre><code>npm create vite@latest my-app -- --template react</code></pre>
      
      <p>Sonra Supabase klientini quraşdırın:</p>
      <pre><code>npm install @supabase/supabase-js</code></pre>
      
      <h2>Supabase-in Qurulması</h2>
      <p>supabase.com-da yeni layihə yaradın, sonra layihə URL-ini və anon açarını götürün. Klienti işə salmaq üçün konfiqurasiya faylı yaradın:</p>
      
      <pre><code>import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)</code></pre>
      
      <p>İndi qurmağa hazırsınız! Növbəti yazıda autentifikasiya və verilənlər bazası əməliyyatlarını əhatə edəcəyik.</p>
    `,
    cover_image: null,
    published: true,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Mastering Google Ads for Performance Marketing",
    title_az: "Performance Marketinq üçün Google Ads-də Ustalıq",
    slug: "mastering-google-ads-performance-marketing",
    excerpt: "Tips and strategies for running successful Google Ads campaigns that drive results.",
    excerpt_az: "Nəticə gətirən uğurlu Google Ads kampaniyaları aparmaq üçün məsləhətlər və strategiyalar.",
    content: `
      <p>Performance marketing with Google Ads requires a strategic approach. After managing high-budget campaigns, I've learned what works and what doesn't.</p>
      
      <h2>Understanding Campaign Types</h2>
      <p>Google Ads offers several campaign types, each suited for different goals:</p>
      <ul>
        <li><strong>Search campaigns</strong> - Best for capturing intent-based traffic</li>
        <li><strong>Display campaigns</strong> - Great for brand awareness and remarketing</li>
        <li><strong>Performance Max</strong> - AI-driven campaigns across all Google properties</li>
        <li><strong>Video campaigns</strong> - YouTube ads for engagement</li>
      </ul>
      
      <h2>Conversion Tracking is Essential</h2>
      <p>Without proper conversion tracking, you're flying blind. Set up:</p>
      <ul>
        <li>Google Tag Manager for flexible tracking</li>
        <li>Primary conversions for your main goals</li>
        <li>Secondary conversions for micro-actions</li>
        <li>Enhanced conversions for better attribution</li>
      </ul>
      
      <h2>Bid Strategies</h2>
      <p>Start with Target CPA or Target ROAS once you have enough conversion data. Manual bidding can work for smaller budgets where you need more control.</p>
      
      <blockquote>
        <p>"The key to successful Google Ads is constant testing and optimization. Never set and forget."</p>
      </blockquote>
      
      <p>Stay tuned for more advanced strategies in upcoming posts!</p>
    `,
    content_az: `
      <p>Google Ads ilə performance marketinq strategiya tələb edir. Yüksək büdcəli kampaniyalar idarə etdikdən sonra nəyin işlədiyini və nəyin işləmədiyini öyrənmişəm.</p>
      
      <h2>Kampaniya növlərini anlamaq</h2>
      <p>Google Ads müxtəlif məqsədlərə uyğun bir neçə kampaniya növü təklif edir:</p>
      <ul>
        <li><strong>Search kampaniyaları</strong> — Niyyət əsaslı trafik tutmaq üçün ən yaxşısı</li>
        <li><strong>Display kampaniyaları</strong> — Brend tanınması və remarketing üçün əladır</li>
        <li><strong>Performance Max</strong> — Bütün Google platformalarında AI əsaslı kampaniyalar</li>
        <li><strong>Video kampaniyaları</strong> — Engagement üçün YouTube reklamları</li>
      </ul>
      
      <h2>Konversiya izləməsi vacibdir</h2>
      <p>Düzgün konversiya izləməsi olmadan kor uçursunuz. Qurun:</p>
      <ul>
        <li>Çevik izləmə üçün Google Tag Manager</li>
        <li>Əsas məqsədləriniz üçün primary konversiyalar</li>
        <li>Mikro-hərəkətlər üçün secondary konversiyalar</li>
        <li>Daha yaxşı atribusiya üçün enhanced konversiyalar</li>
      </ul>
      
      <h2>Bid strategiyaları</h2>
      <p>Kifayət qədər konversiya məlumatınız olduqda Target CPA və ya Target ROAS ilə başlayın. Daha çox nəzarət lazım olan kiçik büdcələrdə manual bidding işləyə bilər.</p>
      
      <blockquote>
        <p>"Uğurlu Google Ads-in açarı daimi test və optimallaşdırmadır. Heç vaxt qurub unutmayın."</p>
      </blockquote>
      
      <p>Növbəti yazılarda daha təkmil strategiyalar üçün bizi izləyin!</p>
    `,
    cover_image: null,
    published: true,
    created_at: "2026-07-25T14:30:00Z",
    updated_at: "2026-07-25T14:30:00Z"
  },
  {
    id: 3,
    title: "Building Android Apps with Kotlin and MVVM",
    title_az: "Kotlin və MVVM ilə Android Tətbiqləri Qurmaq",
    slug: "building-android-apps-kotlin-mvvm",
    excerpt: "A comprehensive guide to modern Android development using Kotlin, MVVM architecture, and Jetpack libraries.",
    excerpt_az: "Kotlin, MVVM arxitekturası və Jetpack kitabxanaları ilə müasir Android inkişafına dair hərtərəfli bələdçi.",
    content: `
      <p>Modern Android development has evolved significantly. Kotlin is now the preferred language, and MVVM (Model-View-ViewModel) is the recommended architecture pattern.</p>
      
      <h2>Why MVVM?</h2>
      <p>MVVM separates your app into three distinct layers:</p>
      <ul>
        <li><strong>Model</strong> - Your data layer (Room database, API calls)</li>
        <li><strong>View</strong> - Your UI (Activities, Fragments, Compose)</li>
        <li><strong>ViewModel</strong> - The bridge between Model and View</li>
      </ul>
      
      <h2>Key Jetpack Libraries</h2>
      <p>Google's Jetpack libraries make MVVM implementation straightforward:</p>
      
      <h3>Room Database</h3>
      <p>Room provides an abstraction layer over SQLite for local data persistence.</p>
      
      <h3>Retrofit</h3>
      <p>Type-safe HTTP client for making API calls. Combined with Kotlin Coroutines, it makes async operations clean and readable.</p>
      
      <h3>LiveData & StateFlow</h3>
      <p>Lifecycle-aware observable data holders. StateFlow is the modern Kotlin way to handle reactive streams.</p>
      
      <h2>Coroutines for Async Operations</h2>
      <pre><code>viewModelScope.launch {
    val result = repository.fetchData()
    _uiState.value = result
}</code></pre>
      
      <p>This pattern keeps your UI responsive while handling background operations safely.</p>
    `,
    content_az: `
      <p>Müasir Android inkişafı əhəmiyyətli dərəcədə irəliləyib. Kotlin indi üstünlük verilən dildir və MVVM (Model-View-ViewModel) tövsiyə olunan arxitektura modelidir.</p>
      
      <h2>Niyə MVVM?</h2>
      <p>MVVM tətbiqinizi üç ayrı təbəqəyə bölür:</p>
      <ul>
        <li><strong>Model</strong> — Məlumat təbəqəniz (Room verilənlər bazası, API çağırışları)</li>
        <li><strong>View</strong> — UI-niz (Activities, Fragments, Compose)</li>
        <li><strong>ViewModel</strong> — Model ilə View arasındakı körpü</li>
      </ul>
      
      <h2>Əsas Jetpack kitabxanaları</h2>
      <p>Google-un Jetpack kitabxanaları MVVM tətbiqini sadələşdirir:</p>
      
      <h3>Room Database</h3>
      <p>Room yerli məlumat saxlama üçün SQLite üzərində abstraksiya təbəqəsi təqdim edir.</p>
      
      <h3>Retrofit</h3>
      <p>API çağırışları üçün tip-təhlükəsiz HTTP klient. Kotlin Coroutines ilə birlikdə async əməliyyatları təmiz və oxunaqlı edir.</p>
      
      <h3>LiveData & StateFlow</h3>
      <p>Lifecycle-aware müşahidə oluna bilən məlumat tutucuları. StateFlow reaktiv axınları idarə etməyin müasir Kotlin yoludur.</p>
      
      <h2>Async əməliyyatlar üçün Coroutines</h2>
      <pre><code>viewModelScope.launch {
    val result = repository.fetchData()
    _uiState.value = result
}</code></pre>
      
      <p>Bu pattern arxa fondakı əməliyyatları təhlükəsiz idarə edərkən UI-ni responsiv saxlayır.</p>
    `,
    cover_image: null,
    published: true,
    created_at: "2026-07-18T09:15:00Z",
    updated_at: "2026-07-18T09:15:00Z"
  }
];

export default defaultPosts;
