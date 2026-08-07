-- Supabase SQL Schema for imfarid.com
-- Run this in your Supabase SQL Editor

-- Experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id SERIAL PRIMARY KEY,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  description TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects/Portfolio table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  cover_image TEXT,
  images TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills table (optional - can also be hardcoded)
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read experiences" ON experiences FOR SELECT USING (true);
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (published = true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public read skills" ON skills FOR SELECT USING (true);

-- Insert default experiences
INSERT INTO experiences (company, position, location, start_date, end_date, description, sort_order) VALUES
('Meridian Media', 'Lead IT Specialist', 'Remote', 'August 2026', 'Present', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Coordinated product management, inventory workflows, and order processing systems', 'Providing technical support to the customers'], 1),
('Kodely', 'Co-Founder & CTO', 'Remote', 'August 2026', 'Present', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Coordinated product management, inventory workflows, and order processing systems'], 2),
('Lumex Ltd.', 'Lead IT Specialist', 'Hybrid', 'June 2026', 'Present', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Implemented tracking solutions (pixels, analytics, data flow) to ensure accurate performance', 'Monitored production environments and resolved hosting, domain, and deployment-related issues'], 3),
('Solidleads Ltd.', 'IT Specialist', 'On-Site', 'May 2026', 'Present', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Implemented tracking solutions (pixels, analytics, data flow) to ensure accurate performance monitoring'], 4),
('ROI House', 'IT Specialist', 'Remote', 'March 2026', 'June 2026', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Monitored production environments and resolved hosting, domain, and deployment-related issues'], 5),
('Traffbraza LLC', 'IT Specialist', 'Remote', 'December 2025', 'July 2026', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed server-side hosting environments, including configuration, deployment, and maintenance', 'Implemented tracking solutions to ensure accurate performance monitoring'], 6),
('ROI House', 'Affiliate Mediabuyer', 'Remote', 'July 2025', 'January 2026', ARRAY['Launched and optimized performance-driven campaigns through Google Ads for affiliate offers', 'Monitored campaign performance, budgets, and conversion tracking to maximize ROI and lead quality'], 7),
('Traffle Agency', 'IT Specialist & IT Operations Manager', 'Remote', 'January 2025', 'November 2025', ARRAY['Developed and deployed PHP-based, React-based, and Next.js-based websites integrated with internal affiliate and tracking systems', 'Managed hosting environments, server configurations, and technical infrastructure', 'Oversaw IT operations to ensure smooth workflow, system stability, and timely project delivery', 'Coordinated technical processes between development and marketing teams'], 8),
('Selcany.com, Kennzy.com & Hexamats.com', 'Ecommerce Manager', 'Hybrid', 'January 2022', 'February 2023', ARRAY['Managed technical operations of three e-commerce platforms, ensuring website stability and performance', 'Oversaw hosting environments, frontend updates, and platform maintenance', 'Coordinated product management, inventory workflows, and order processing systems'], 9),
('Solidleads Ltd.', 'IT Specialist & Affiliate Mediabuyer', 'On-site', 'February 2021', 'April 2025', ARRAY['Developed and deployed PHP-based websites integrated with internal affiliate and tracking systems', 'Managed high-budget advertising campaigns across Google Ads, Microsoft Ads, Meta Ads, Kayzen, UAC', 'Optimized campaigns through audience targeting, bid strategies, funnel testing, and performance analysis', 'Executed App Store Optimization (ASO) strategies to improve app visibility and conversion rates'], 10),
('SM Consulting', 'Full Stack Web Developer Intern', 'On-site', 'September 2020', 'January 2021', ARRAY['Developed web applications using C# and .NET technologies', 'Built and maintained responsive front-end interfaces using HTML, CSS, and JavaScript', 'Collaborated with team members to implement new functionalities and improve code quality'], 11),
('Zipatto Smart Home Systems', 'Full Stack Web Developer Intern', 'On-site', 'December 2019', 'February 2020', ARRAY['Developed web applications using C# and .NET technologies', 'Built and maintained responsive front-end interfaces using HTML, CSS, and JavaScript'], 12),
('Millisoft', 'Information Technology Mentor', 'On-site', 'June 2019', 'November 2019', ARRAY['Mentored students in web development fundamentals and practical coding exercises', 'Provided code reviews, technical feedback, and problem-solving support'], 13);
