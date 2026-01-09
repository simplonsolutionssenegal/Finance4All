// frontend/app/api/beneficiaire/dashboard/stats/route.ts

import { auth } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
// eslint-disable-next-line no-duplicate-imports
import { NextResponse } from 'next/server';

export async function GET(_request: NextRequest) {
  try {
    // Authentification avec Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Pour l'instant, on retourne des données mockées
    // Remplacez ceci par vos vraies requêtes de base de données
    const beneficiaireDashboardData = {
      stats: {
        modulesCompleted: {
          current: 8,
          total: 26,
        },
        learningTime: '24h 30m',
        quizzesPassed: {
          current: 12,
          total: 15,
        },
        globalProgress: 75,
      },
      moduleStats: {
        completed: 8,
        inProgress: 5,
        notStarted: 13,
        total: 26,
      },
      monthlyProgress: [
        { month: 'Jan', progress: 20 },
        { month: 'Fév', progress: 35 },
        { month: 'Mar', progress: 50 },
        { month: 'Avr', progress: 60 },
        { month: 'Mai', progress: 70 },
        { month: 'Juin', progress: 75 },
      ],
    };

    // Exemple avec Prisma (à décommenter et adapter) :
    /*
    // Récupérer les informations du bénéficiaire
    const beneficiaire = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        moduleProgress: {
          include: {
            module: true
          }
        },
        quizResults: true
      }
    });

    if (!beneficiaire) {
      return NextResponse.json(
        { error: 'Bénéficiaire non trouvé' },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const totalModules = await prisma.module.count({ where: { isActive: true } });
    
    const completedModules = beneficiaire.moduleProgress.filter(
      mp => mp.status === 'COMPLETED'
    ).length;
    
    const inProgressModules = beneficiaire.moduleProgress.filter(
      mp => mp.status === 'IN_PROGRESS'
    ).length;

    const notStartedModules = totalModules - completedModules - inProgressModules;

    // Calculer le temps total d'apprentissage
    const totalTimeMinutes = beneficiaire.moduleProgress.reduce(
      (acc, mp) => acc + (mp.timeSpent || 0),
      0
    );
    const learningTime = formatTime(totalTimeMinutes);

    // Calculer les quiz réussis
    const passedQuizzes = beneficiaire.quizResults.filter(qr => qr.passed).length;
    const totalQuizzes = beneficiaire.quizResults.length;

    // Calculer la progression globale
    const globalProgress = totalModules > 0 
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    // Récupérer la progression mensuelle (6 derniers mois)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyProgressData = await prisma.moduleProgress.groupBy({
      by: ['completedAt'],
      where: {
        userId: beneficiaire.id,
        status: 'COMPLETED',
        completedAt: {
          gte: sixMonthsAgo
        }
      },
      _count: true
    });

    // Formater les données mensuelles
    const monthlyProgress = formatMonthlyProgress(monthlyProgressData);

    const beneficiaireDashboardData = {
      stats: {
        modulesCompleted: {
          current: completedModules,
          total: totalModules
        },
        learningTime,
        quizzesPassed: {
          current: passedQuizzes,
          total: totalQuizzes
        },
        globalProgress
      },
      moduleStats: {
        completed: completedModules,
        inProgress: inProgressModules,
        notStarted: notStartedModules,
        total: totalModules
      },
      monthlyProgress
    };
    */

    return NextResponse.json(beneficiaireDashboardData);
  } catch (error) {
    console.error('Erreur API dashboard bénéficiaire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

// Fonction utilitaire pour formater le temps
/*
function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
*/

// Fonction pour formater les données mensuelles (exemple)
/*
function formatMonthlyProgress(data: any[]): Array<{ month: string; progress: number }> {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const result = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthIndex = date.getMonth();
    
    // Compter les modules complétés ce mois
    const completedThisMonth = data.filter(d => {
      const completedDate = new Date(d.completedAt);
      return completedDate.getMonth() === monthIndex;
    }).length;
    
    result.push({
      month: months[monthIndex],
      progress: completedThisMonth
    });
  }
  
  return result;
}
*/
