const defaultPosts = [
  {
    id: 1,
    title: "Getting Started with React and Supabase",
    slug: "getting-started-react-supabase",
    excerpt: "Learn how to build modern web applications using React.js and Supabase as your backend-as-a-service.",
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
    cover_image: null,
    published: true,
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-01T10:00:00Z"
  },
  {
    id: 2,
    title: "Mastering Google Ads for Performance Marketing",
    slug: "mastering-google-ads-performance-marketing",
    excerpt: "Tips and strategies for running successful Google Ads campaigns that drive results.",
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
    cover_image: null,
    published: true,
    created_at: "2026-07-25T14:30:00Z",
    updated_at: "2026-07-25T14:30:00Z"
  },
  {
    id: 3,
    title: "Building Android Apps with Kotlin and MVVM",
    slug: "building-android-apps-kotlin-mvvm",
    excerpt: "A comprehensive guide to modern Android development using Kotlin, MVVM architecture, and Jetpack libraries.",
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
    cover_image: null,
    published: true,
    created_at: "2026-07-18T09:15:00Z",
    updated_at: "2026-07-18T09:15:00Z"
  }
];

export default defaultPosts;
