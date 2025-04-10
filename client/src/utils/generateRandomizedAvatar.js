import { avatarColors } from "./constants"

export const getRandomizedColor = () => {
  const keys = Object.keys(avatarColors);
  const randomIndex = Math.floor(Math.random() * keys.length);

  return keys[randomIndex];
}