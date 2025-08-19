import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';
import { OrganisationModel } from '../models/schemas/Organisation.schema';
import { UserModel } from '../models/schemas/User.schema';
import { sendEmail } from '../utils/sendMail';
import { generatePassword } from '../utils/generatePassword';
import { IOrganisation } from '../models/interfaces/Organisation.interface';
import { ICreator } from '../models/types';
import { Types } from 'mongoose';

export const createOrganisation = async (
  data: Partial<IOrganisation>,
  logoFile: Express.Multer.File,
  creator: ICreator
) => {
  const countryId: Types.ObjectId | string = creator.role === 'SUPER_ADMIN' ? data.country! : creator.country;

  if (!countryId) {
    throw new Error('Le pays est requis.');
  }

  const logoDir = path.join(__dirname, '../../assets/logos');
  if (!fs.existsSync(logoDir)) {
    fs.mkdirSync(logoDir, { recursive: true });
  }

  const logoFileName = `${Date.now()}-${logoFile.originalname}`;
  const logoPath = path.join(logoDir, logoFileName);
  fs.writeFileSync(logoPath, logoFile.buffer);

  const logoUrl = `assets/logos/${logoFileName}`;

  const organisation = await OrganisationModel.create({
    ...data,
    country: countryId,
    createdBy: creator._id,
    logoUrl,
  });

  const password = generatePassword();
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await UserModel.create({
    firstName: 'Admin',
    lastName: organisation.name,
    email: data.email,
    password: hashedPassword,
    role: 'ADMIN_ORG',
    phone: data.phone,
    country: countryId,
    organisationId: organisation._id,
    isActive: true,
    status: 'ACTIF'
  });

  await sendEmail(
    admin.email,
    'Création de votre compte administrateur d’organisation',
    `
    <h2>Bienvenue ${organisation.name}</h2>
    <p>Votre compte administrateur a été créé.</p>
    <p>Email : ${admin.email}</p>
    <p>Mot de passe : ${password}</p>
    <a href="${process.env.FRONTEND_URL}/login">Se connecter</a>
    `
  );

  return organisation;
};

export const getOrganisations = async () => {
  return await OrganisationModel.find().populate('country createdBy');
};

export const getOrganisationById = async (id: string) => {
  const organisation = await OrganisationModel.findById(id).populate('country createdBy');
  if (!organisation) throw new Error('Organisation introuvable');
  return organisation;
};

export const updateOrganisation = async (id: string, data: Partial<IOrganisation>) => {
  const organisation = await OrganisationModel.findByIdAndUpdate(id, data, { new: true });
  if (!organisation) throw new Error('Organisation introuvable');
  return organisation;
};

export const deleteOrganisation = async (id: string) => {
  const organisation = await OrganisationModel.findByIdAndDelete(id);
  if (!organisation) throw new Error('Organisation introuvable');
  return organisation;
};

export const getOrganisationsByCountry = async (countryId: string) => {
  return await OrganisationModel.find({ country: countryId }).populate('country createdBy');
};

export const getOrganisationsByCreator = async (creatorId: string) => {
  return await OrganisationModel.find({ createdBy: creatorId }).populate('country createdBy');
};
