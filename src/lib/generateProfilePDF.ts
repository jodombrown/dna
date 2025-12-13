import jsPDF from 'jspdf';

interface ProfileData {
  display_name?: string;
  full_name?: string;
  username?: string;
  headline?: string;
  professional_role?: string;
  bio?: string;
  location?: string;
  current_country?: string;
  country_of_origin?: string;
  email?: string;
  phone_number?: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  avatar_url?: string;
  skills?: string[];
  interests?: string[];
  focus_areas?: string[];
  available_for?: string[];
  languages?: string[];
  industry?: string;
  years_experience?: number;
  company?: string;
}

const DNA_COLORS = {
  dark: '#1a1a2e',
  accent: '#d4a574',
  text: '#333333',
  lightText: '#666666',
  white: '#ffffff',
  border: '#e5e5e5',
};

export async function generateProfilePDF(profile: ProfileData): Promise<void> {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const sidebarWidth = 70;
  const mainWidth = pageWidth - sidebarWidth;
  const margin = 8;
  
  // Draw dark sidebar
  doc.setFillColor(26, 26, 46); // DNA dark
  doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
  
  // Draw main content area
  doc.setFillColor(255, 255, 255);
  doc.rect(sidebarWidth, 0, mainWidth, pageHeight, 'F');
  
  // Avatar placeholder (circle)
  const avatarSize = 45;
  const avatarX = sidebarWidth / 2;
  const avatarY = 35;
  
  // Draw avatar circle background
  doc.setFillColor(212, 165, 116); // DNA accent
  doc.circle(avatarX, avatarY, avatarSize / 2, 'F');
  
  // If avatar URL exists, try to load it
  if (profile.avatar_url) {
    try {
      const img = await loadImage(profile.avatar_url);
      // Create circular clip effect by drawing image
      doc.addImage(img, 'JPEG', avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize);
    } catch (e) {
      // Draw initials if image fails
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      const initials = getInitials(profile.display_name || profile.full_name || profile.username || 'U');
      doc.text(initials, avatarX, avatarY + 3, { align: 'center' });
    }
  } else {
    // Draw initials
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const initials = getInitials(profile.display_name || profile.full_name || profile.username || 'U');
    doc.text(initials, avatarX, avatarY + 3, { align: 'center' });
  }
  
  let sidebarY = avatarY + avatarSize / 2 + 15;
  
  // Contact Section
  sidebarY = drawSidebarSection(doc, 'CONTACT', sidebarY, sidebarWidth, margin);
  
  if (profile.email) {
    sidebarY = drawSidebarItem(doc, '✉', profile.email, sidebarY, sidebarWidth, margin);
  }
  if (profile.phone_number) {
    sidebarY = drawSidebarItem(doc, '☎', profile.phone_number, sidebarY, sidebarWidth, margin);
  }
  if (profile.linkedin_url) {
    const linkedinHandle = profile.linkedin_url.split('/').pop() || 'LinkedIn';
    sidebarY = drawSidebarItem(doc, 'in', linkedinHandle, sidebarY, sidebarWidth, margin);
  }
  if (profile.location || profile.current_country) {
    sidebarY = drawSidebarItem(doc, '◉', profile.location || profile.current_country || '', sidebarY, sidebarWidth, margin);
  }
  
  sidebarY += 5;
  
  // Heritage Section
  if (profile.country_of_origin || (profile.languages && profile.languages.length > 0)) {
    sidebarY = drawSidebarSection(doc, 'HERITAGE', sidebarY, sidebarWidth, margin);
    
    if (profile.country_of_origin) {
      sidebarY = drawSidebarItem(doc, '🌍', `Origin: ${profile.country_of_origin}`, sidebarY, sidebarWidth, margin);
    }
    if (profile.languages && profile.languages.length > 0) {
      sidebarY = drawSidebarItem(doc, '🗣', profile.languages.slice(0, 3).join(', '), sidebarY, sidebarWidth, margin);
    }
    sidebarY += 5;
  }
  
  // Skills Section
  if (profile.skills && profile.skills.length > 0) {
    sidebarY = drawSidebarSection(doc, 'SKILLS', sidebarY, sidebarWidth, margin);
    
    profile.skills.slice(0, 8).forEach((skill) => {
      sidebarY = drawSidebarBullet(doc, skill, sidebarY, sidebarWidth, margin);
    });
    sidebarY += 5;
  }
  
  // Focus Areas Section
  if (profile.focus_areas && profile.focus_areas.length > 0) {
    sidebarY = drawSidebarSection(doc, 'FOCUS AREAS', sidebarY, sidebarWidth, margin);
    
    profile.focus_areas.slice(0, 5).forEach((area) => {
      sidebarY = drawSidebarBullet(doc, area, sidebarY, sidebarWidth, margin);
    });
    sidebarY += 5;
  }
  
  // Available For Section
  if (profile.available_for && profile.available_for.length > 0) {
    sidebarY = drawSidebarSection(doc, 'OPEN TO', sidebarY, sidebarWidth, margin);
    
    profile.available_for.slice(0, 5).forEach((item) => {
      sidebarY = drawSidebarBullet(doc, item, sidebarY, sidebarWidth, margin);
    });
  }
  
  // Main Content Area
  let mainY = 25;
  const mainX = sidebarWidth + 12;
  const mainContentWidth = mainWidth - 24;
  
  // Name
  doc.setTextColor(212, 165, 116); // DNA accent
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const displayName = profile.display_name || profile.full_name || profile.username || 'DNA Member';
  doc.text(displayName.toUpperCase(), mainX, mainY);
  mainY += 10;
  
  // Professional Title
  if (profile.headline || profile.professional_role) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const title = profile.headline || profile.professional_role || '';
    doc.text(title.toUpperCase(), mainX, mainY);
    mainY += 8;
  }
  
  // Company & Experience
  if (profile.company || profile.years_experience) {
    doc.setTextColor(120, 120, 120);
    doc.setFontSize(10);
    let companyLine = '';
    if (profile.company) companyLine += profile.company;
    if (profile.years_experience) {
      companyLine += companyLine ? ` • ${profile.years_experience} years experience` : `${profile.years_experience} years experience`;
    }
    doc.text(companyLine, mainX, mainY);
    mainY += 5;
  }
  
  mainY += 10;
  
  // Professional Summary
  if (profile.bio) {
    mainY = drawMainSection(doc, 'PROFESSIONAL SUMMARY', mainY, mainX, mainContentWidth);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const bioLines = doc.splitTextToSize(profile.bio, mainContentWidth);
    doc.text(bioLines, mainX, mainY);
    mainY += bioLines.length * 5 + 10;
  }
  
  // Interests Section
  if (profile.interests && profile.interests.length > 0) {
    mainY = drawMainSection(doc, 'INTERESTS & PASSIONS', mainY, mainX, mainContentWidth);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const interestsText = profile.interests.join(' • ');
    const interestLines = doc.splitTextToSize(interestsText, mainContentWidth);
    doc.text(interestLines, mainX, mainY);
    mainY += interestLines.length * 5 + 10;
  }
  
  // Industry Section
  if (profile.industry) {
    mainY = drawMainSection(doc, 'INDUSTRY', mainY, mainX, mainContentWidth);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(profile.industry, mainX, mainY);
    mainY += 15;
  }
  
  // DNA Footer
  doc.setFillColor(212, 165, 116);
  doc.rect(sidebarWidth, pageHeight - 15, mainWidth, 15, 'F');
  
  doc.setTextColor(26, 26, 46);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('DIASPORA NETWORK OF AFRICA', sidebarWidth + mainWidth / 2, pageHeight - 8, { align: 'center' });
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('diasporanetwork.africa', sidebarWidth + mainWidth / 2, pageHeight - 4, { align: 'center' });
  
  // Save the PDF
  const fileName = `${(profile.username || profile.display_name || 'profile').replace(/\s+/g, '_')}_DNA_Profile.pdf`;
  doc.save(fileName);
}

function drawSidebarSection(doc: jsPDF, title: string, y: number, sidebarWidth: number, margin: number): number {
  doc.setTextColor(212, 165, 116); // DNA accent
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  
  // Underline
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.3);
  doc.line(margin, y + 2, sidebarWidth - margin, y + 2);
  
  return y + 10;
}

function drawSidebarItem(doc: jsPDF, icon: string, text: string, y: number, sidebarWidth: number, margin: number): number {
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Icon
  doc.setTextColor(212, 165, 116);
  doc.text(icon, margin, y);
  
  // Text - wrap if too long
  doc.setTextColor(200, 200, 200);
  const maxWidth = sidebarWidth - margin * 2 - 8;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin + 8, y);
  
  return y + (lines.length * 4) + 3;
}

function drawSidebarBullet(doc: jsPDF, text: string, y: number, sidebarWidth: number, margin: number): number {
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Bullet
  doc.setTextColor(212, 165, 116);
  doc.text('•', margin + 2, y);
  
  // Text
  doc.setTextColor(200, 200, 200);
  const maxWidth = sidebarWidth - margin * 2 - 8;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin + 8, y);
  
  return y + (lines.length * 4) + 2;
}

function drawMainSection(doc: jsPDF, title: string, y: number, x: number, width: number): number {
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x, y);
  
  // Underline
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.5);
  doc.line(x, y + 2, x + width * 0.4, y + 2);
  
  return y + 10;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

async function loadImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}
