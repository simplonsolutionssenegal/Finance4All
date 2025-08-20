// Connexion à MongoDB avec gestion des erreurs
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    if (error instanceof Error) {
      console.error('❌ Erreur de connexion à MongoDB:', error.message);
    } else {
      console.error('❌ Erreur de connexion à MongoDB:', error);
    }
    process.exit(1); // Arrêt du serveur si erreur
  }
};

module.exports = connectDB;
