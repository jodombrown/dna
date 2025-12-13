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

// DNA Brand Colors
const DNA_COLORS = {
  dark: '#1C3D3C',       // DNA forest/dark green
  accent: '#D4A574',     // DNA copper/gold
  emerald: '#10B981',    // DNA emerald
  text: '#1F2937',       // Dark gray text
  lightText: '#6B7280',  // Muted text
  white: '#FFFFFF',
  sidebarText: '#E5E7EB',
};

export async function generateProfilePDF(profile: ProfileData): Promise<void> {
  // Create PDF in Letter size (8.5 x 11 inches = 215.9 x 279.4 mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter',
  });
  
  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 279.4mm
  
  const sidebarWidth = 72;
  const mainWidth = pageWidth - sidebarWidth;
  const margin = 10;
  
  // Draw dark sidebar
  doc.setFillColor(28, 61, 60); // DNA forest
  doc.rect(0, 0, sidebarWidth, pageHeight, 'F');
  
  // Draw main content area
  doc.setFillColor(255, 255, 255);
  doc.rect(sidebarWidth, 0, mainWidth, pageHeight, 'F');
  
  // Avatar placeholder (circle)
  const avatarSize = 48;
  const avatarX = sidebarWidth / 2;
  const avatarY = 40;
  
  // Draw avatar circle background
  doc.setFillColor(212, 165, 116); // DNA copper
  doc.circle(avatarX, avatarY, avatarSize / 2, 'F');
  
  // If avatar URL exists, try to load it
  if (profile.avatar_url) {
    try {
      const img = await loadImage(profile.avatar_url);
      doc.addImage(img, 'JPEG', avatarX - avatarSize/2, avatarY - avatarSize/2, avatarSize, avatarSize);
    } catch (e) {
      // Draw initials if image fails
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      const initials = getInitials(profile.display_name || profile.full_name || profile.username || 'U');
      doc.text(initials, avatarX, avatarY + 3, { align: 'center' });
    }
  } else {
    // Draw initials
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    const initials = getInitials(profile.display_name || profile.full_name || profile.username || 'U');
    doc.text(initials, avatarX, avatarY + 3, { align: 'center' });
  }
  
  let sidebarY = avatarY + avatarSize / 2 + 18;
  
  // Contact Section
  sidebarY = drawSidebarSection(doc, 'CONTACT', sidebarY, sidebarWidth, margin);
  
  if (profile.email) {
    sidebarY = drawSidebarItem(doc, 'Email:', profile.email, sidebarY, sidebarWidth, margin);
  }
  if (profile.linkedin_url) {
    const linkedinHandle = profile.linkedin_url.includes('linkedin.com') 
      ? profile.linkedin_url.split('/').filter(Boolean).pop() || 'LinkedIn'
      : profile.linkedin_url;
    sidebarY = drawSidebarItem(doc, 'LinkedIn:', linkedinHandle, sidebarY, sidebarWidth, margin);
  }
  if (profile.location || profile.current_country) {
    sidebarY = drawSidebarItem(doc, 'Location:', profile.location || profile.current_country || '', sidebarY, sidebarWidth, margin);
  }
  
  sidebarY += 8;
  
  // Heritage Section
  if (profile.country_of_origin || (profile.languages && profile.languages.length > 0)) {
    sidebarY = drawSidebarSection(doc, 'HERITAGE', sidebarY, sidebarWidth, margin);
    
    if (profile.country_of_origin) {
      sidebarY = drawSidebarItem(doc, 'Origin:', profile.country_of_origin, sidebarY, sidebarWidth, margin);
    }
    if (profile.languages && profile.languages.length > 0) {
      sidebarY = drawSidebarItem(doc, 'Languages:', profile.languages.slice(0, 3).join(', '), sidebarY, sidebarWidth, margin);
    }
    sidebarY += 8;
  }
  
  // Skills Section
  if (profile.skills && profile.skills.length > 0) {
    sidebarY = drawSidebarSection(doc, 'SKILLS', sidebarY, sidebarWidth, margin);
    
    profile.skills.slice(0, 8).forEach((skill) => {
      sidebarY = drawSidebarBullet(doc, skill, sidebarY, sidebarWidth, margin);
    });
    sidebarY += 8;
  }
  
  // Focus Areas Section
  if (profile.focus_areas && profile.focus_areas.length > 0) {
    sidebarY = drawSidebarSection(doc, 'FOCUS AREAS', sidebarY, sidebarWidth, margin);
    
    profile.focus_areas.slice(0, 5).forEach((area) => {
      sidebarY = drawSidebarBullet(doc, area, sidebarY, sidebarWidth, margin);
    });
    sidebarY += 8;
  }
  
  // Available For Section
  if (profile.available_for && profile.available_for.length > 0) {
    sidebarY = drawSidebarSection(doc, 'OPEN TO', sidebarY, sidebarWidth, margin);
    
    profile.available_for.slice(0, 5).forEach((item) => {
      sidebarY = drawSidebarBullet(doc, item, sidebarY, sidebarWidth, margin);
    });
  }
  
  // Main Content Area
  let mainY = 30;
  const mainX = sidebarWidth + 15;
  const mainContentWidth = mainWidth - 30;
  
  // Name - using DNA copper color
  doc.setTextColor(212, 165, 116); // DNA copper
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const displayName = profile.display_name || profile.full_name || profile.username || 'DNA Member';
  doc.text(displayName.toUpperCase(), mainX, mainY);
  mainY += 12;
  
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
    mainY += 6;
  }
  
  mainY += 12;
  
  // Professional Summary
  if (profile.bio) {
    mainY = drawMainSection(doc, 'PROFESSIONAL SUMMARY', mainY, mainX, mainContentWidth);
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const bioLines = doc.splitTextToSize(profile.bio, mainContentWidth);
    doc.text(bioLines, mainX, mainY);
    mainY += bioLines.length * 5 + 12;
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
    mainY += interestLines.length * 5 + 12;
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
  
  // DNA Footer Bar
  const footerHeight = 18;
  doc.setFillColor(212, 165, 116); // DNA copper
  doc.rect(sidebarWidth, pageHeight - footerHeight, mainWidth, footerHeight, 'F');
  
  doc.setTextColor(28, 61, 60); // DNA forest
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DIASPORA NETWORK OF AFRICA', sidebarWidth + mainWidth / 2, pageHeight - 10, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('diasporanetwork.africa', sidebarWidth + mainWidth / 2, pageHeight - 5, { align: 'center' });
  
  // Save the PDF
  const fileName = `${(profile.username || profile.display_name || 'profile').replace(/\s+/g, '_')}_DNA_Profile.pdf`;
  doc.save(fileName);
}

function drawSidebarSection(doc: jsPDF, title: string, y: number, sidebarWidth: number, margin: number): number {
  doc.setTextColor(212, 165, 116); // DNA copper
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, y);
  
  // Underline
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.4);
  doc.line(margin, y + 2, sidebarWidth - margin, y + 2);
  
  return y + 12;
}

function drawSidebarItem(doc: jsPDF, label: string, text: string, y: number, sidebarWidth: number, margin: number): number {
  // Label in accent color
  doc.setTextColor(212, 165, 116);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(label, margin, y);
  
  // Value in light text
  doc.setTextColor(229, 231, 235); // Light gray
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const maxWidth = sidebarWidth - margin * 2;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin, y + 4);
  
  return y + (lines.length * 4) + 8;
}

function drawSidebarBullet(doc: jsPDF, text: string, y: number, sidebarWidth: number, margin: number): number {
  // Bullet in accent color
  doc.setTextColor(212, 165, 116);
  doc.setFontSize(8);
  doc.text('•', margin + 2, y);
  
  // Text in light color
  doc.setTextColor(229, 231, 235);
  doc.setFont('helvetica', 'normal');
  
  const maxWidth = sidebarWidth - margin * 2 - 10;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, margin + 8, y);
  
  return y + (lines.length * 4) + 3;
}

function drawMainSection(doc: jsPDF, title: string, y: number, x: number, width: number): number {
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(title, x, y);
  
  // Underline in DNA copper
  doc.setDrawColor(212, 165, 116);
  doc.setLineWidth(0.6);
  doc.line(x, y + 2, x + Math.min(width * 0.5, 80), y + 2);
  
  return y + 12;
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
