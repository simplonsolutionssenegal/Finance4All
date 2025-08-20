import { AdminModel } from '../models/schemas/admin.schema';
import { generatePassword } from '../utils/generatePassword';
import { sendMail } from '../utils/sendMail';
import { UserModel } from '../models/schemas/User.schema';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/generateToken';

export const createAdmin = async (userData: any) => {
  const generatedPassword = generatePassword(19);
  const hashedPassword = await bcrypt.hash(generatedPassword, 10);

  const user = await UserModel.create({
    ...userData,
    password: hashedPassword,
    role: 'ADMIN',
    status: 'ACTIF',
  });

  const admin = await AdminModel.create({
    userId: user._id,
    country: userData.country,
  });

  const token = generateToken(user._id.toString(), 'ACCESS');

  await sendMail(user.email, 'Vos accès administrateur', `
    <h2>Bienvenue Admin</h2>
    <p>Votre mot de passe initial est : <b>${generatedPassword}</b></p>
    <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">Modifier mon mot de passe</a>
    <a href="${process.env.FRONTEND_URL}/login">Me connecter</a>
  `);

  return { user, admin };
};

export const getAdmins = () => AdminModel.find().populate('userId');

export const getAdminById = (id: string) =>
  AdminModel.findById(id).populate('userId');

export const updateAdmin = (id: string, data: any) =>
  AdminModel.findByIdAndUpdate(id, data, { new: true });

export const deleteAdmin = (id: string) =>
  AdminModel.findByIdAndDelete(id);
