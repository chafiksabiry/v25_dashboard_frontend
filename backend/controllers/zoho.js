const getLeads = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No access token provided"
      });
    }

    // Appel à l'API Zoho CRM pour récupérer les leads
    const response = await axios.get('https://www.zohoapis.com/crm/v2/Leads', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({
      success: true,
      leads: response.data.data
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch leads from Zoho CRM'
    });
  }
};

const configureZohoCRM = async (req, res) => {
  try {
    const { clientId, clientSecret, refreshToken } = req.body;

    // Validation des champs requis
    if (!clientId || !clientSecret || !refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont requis (clientId, clientSecret, refreshToken)"
      });
    }

    // Log pour déboguer
    console.log('Received configuration:', {
      clientId,
      clientSecret: '***hidden***',
      refreshToken: '***hidden***'
    });

    // Vérifier la validité des informations en essayant d'obtenir un access token
    const tokenResponse = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token'
      }
    });

    console.log('Zoho token response:', tokenResponse.data);

    if (!tokenResponse.data.access_token) {
      throw new Error('No access token received from Zoho');
    }

    // Sauvegarder dans la base de données
    const config = new ZohoConfig({
      clientId,
      clientSecret,
      refreshToken,
      lastUpdated: new Date()
    });

    await config.save();

    res.json({
      success: true,
      message: "Configuration Zoho CRM mise à jour avec succès",
      accessToken: tokenResponse.data.access_token
    });

  } catch (error) {
    console.error('Error configuring Zoho:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la configuration de Zoho CRM",
      error: error.response?.data || error.message
    });
  }
};

const getDeals = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "No access token provided"
      });
    }

    // Appel à l'API Zoho CRM pour récupérer les deals
    const response = await axios.get('https://www.zohoapis.com/crm/v2/Deals', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to fetch deals from Zoho CRM'
    });
  }
}; 