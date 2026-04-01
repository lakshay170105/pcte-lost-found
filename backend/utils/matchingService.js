import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import User from '../models/User.js';
import { sendEmail, emailTemplates } from './emailService.js';

// Calculate match score between lost and found items
export const calculateMatchScore = (lostItem, foundItem) => {
  let score = 0;
  
  // Name matching (40 points)
  const lostName = lostItem.name.toLowerCase();
  const foundName = foundItem.name.toLowerCase();
  if (lostName === foundName) score += 40;
  else if (lostName.includes(foundName) || foundName.includes(lostName)) score += 30;
  else if (lostName.split(' ').some(word => foundName.includes(word))) score += 20;
  
  // Description matching (30 points)
  const lostDesc = lostItem.description.toLowerCase();
  const foundDesc = foundItem.description.toLowerCase();
  const lostWords = lostDesc.split(' ').filter(w => w.length > 3);
  const foundWords = foundDesc.split(' ').filter(w => w.length > 3);
  const commonWords = lostWords.filter(word => foundWords.includes(word));
  score += Math.min(30, commonWords.length * 5);
  
  // Location proximity (20 points)
  const lostLoc = lostItem.location.toLowerCase();
  const foundLoc = foundItem.location.toLowerCase();
  if (lostLoc === foundLoc) score += 20;
  else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) score += 15;
  else if (lostLoc.split(' ').some(word => foundLoc.includes(word))) score += 10;
  
  // Date proximity (10 points)
  const daysDiff = Math.abs((new Date(lostItem.date) - new Date(foundItem.date)) / (1000 * 60 * 60 * 24));
  if (daysDiff <= 1) score += 10;
  else if (daysDiff <= 3) score += 7;
  else if (daysDiff <= 7) score += 5;
  else if (daysDiff <= 14) score += 3;
  
  return score;
};

// Find matches for a lost item
export const findMatchesForLostItem = async (lostItem) => {
  try {
    const foundItems = await FoundItem.find({ 
      status: 'available' 
    }).populate('user', 'name email');
    
    const matches = [];
    
    for (const foundItem of foundItems) {
      const score = calculateMatchScore(lostItem, foundItem);
      
      // Only consider matches with score >= 40 (good match)
      if (score >= 40) {
        matches.push({
          foundItem,
          score,
          confidence: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
        });
      }
    }
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
};

// Find matches for a found item
export const findMatchesForFoundItem = async (foundItem) => {
  try {
    const lostItems = await LostItem.find({ 
      status: 'active' 
    }).populate('user', 'name email');
    
    const matches = [];
    
    for (const lostItem of lostItems) {
      const score = calculateMatchScore(lostItem, foundItem);
      
      // Only consider matches with score >= 40
      if (score >= 40) {
        matches.push({
          lostItem,
          score,
          confidence: score >= 70 ? 'high' : score >= 50 ? 'medium' : 'low'
        });
      }
    }
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score);
    
    return matches;
  } catch (error) {
    console.error('Error finding matches:', error);
    return [];
  }
};

// Send match notification emails
export const sendMatchNotifications = async (lostItem, foundItem, matchScore) => {
  try {
    // Get users
    const lostItemUser = await User.findById(lostItem.user);
    const foundItemUser = await User.findById(foundItem.user);
    
    if (!lostItemUser || !foundItemUser) {
      console.log('Users not found for notification');
      return;
    }
    
    // Send email to lost item owner
    await sendEmail({
      to: lostItemUser.email,
      subject: '🎉 Great News! Someone May Have Found Your Lost Item!',
      html: emailTemplates.lostItemMatch(
        lostItemUser.name,
        lostItem,
        foundItem,
        foundItem.contact
      )
    });
    
    // Send email to found item reporter
    await sendEmail({
      to: foundItemUser.email,
      subject: '🎯 Match Found! Your Found Item Matches a Lost Item Report',
      html: emailTemplates.foundItemMatch(
        foundItemUser.name,
        foundItem,
        lostItem,
        lostItem.contact
      )
    });
    
    console.log(`✅ Match notifications sent (Score: ${matchScore})`);
    console.log(`   Lost item owner: ${lostItemUser.email}`);
    console.log(`   Found item reporter: ${foundItemUser.email}`);
    
  } catch (error) {
    console.error('Error sending match notifications:', error);
  }
};

export default {
  calculateMatchScore,
  findMatchesForLostItem,
  findMatchesForFoundItem,
  sendMatchNotifications
};
