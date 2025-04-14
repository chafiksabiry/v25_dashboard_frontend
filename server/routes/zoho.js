const express = require('express');
const router = express.Router();
const { getLeads, getDeals } = require('../controllers/zoho');

// Leads endpoint
router.get('/leads', getLeads);

// Deals endpoint
router.get('/deals', getDeals);

// Mail endpoint (existing)
router.get('/mail', async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    // Appel à l'API Zoho Mail
    const response = await fetch('https://mail.zoho.com/api/accounts', {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    res.json({ success: true, data });

  } catch (error) {
    console.error('Erreur lors de la récupération des emails:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erreur lors de la récupération des emails' 
    });
  }
});

module.exports = router; 