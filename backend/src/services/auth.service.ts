import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/schemas/User.schema';
import { sendEmail } from '../utils/sendMail';
import { generateToken } from '../utils/generateToken';

export const login = async (email: string, password: string) => {
  const user = await UserModel.findOne({ email }) as { _id: string, password: string };
  if (!user) throw new Error('Utilisateur introuvable');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Mot de passe incorrect');

  const token = generateToken(user._id.toString());

  return { token, user };
};

export const forgotPassword = async (email: string) => {
  const user = await UserModel.findOne({ email }) as { _id: string };
  if (!user) throw new Error('Aucun utilisateur avec cet email');

  const token = generateToken(user._id.toString());

  await sendEmail(email, 'Réinitialisation de mot de passe', `
    <h2>Réinitialisation de mot de passe</h2>
    <p>Voici le lien pour changer votre mot de passe :</p>
    <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Réinitialiser le mot de passe</a>
  `);
};

export const resetPassword = async (token: string, newPassword: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
  const user = await UserModel.findById(decoded.id);
  if (!user) throw new Error('Utilisateur non trouvé');

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
};
