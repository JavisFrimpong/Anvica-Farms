import adultChicken1 from '../photos/adult-chicken-1.jpg';
import adultChicken2 from '../photos/adult-chicken-2.jpg';
import fullChicken from '../photos/full-chicken.jpg';
import chickenBack from '../photos/chicken-back.png';
import chickenThighs from '../photos/chicken-thighs.jpg';
import chickenWhigs from '../photos/chicken-wings.jpg';
import smallChicken1 from '../photos/small-chick-1.jpg';
import smallChicken2 from '../photos/small-chick-2.jpg';
import egg from '../photos/eggs.jpg';
import doubleYolk from '../photos/double-yolked-eggs.jpg';


export const products = {
  'live-chicken': {
    id: 'live-poultry-adult',
    name: 'Live Poultry (Adult)',
    price: 100,
    category: 'Live Poultry',
    description: 'Healthy, mature chickens ready for breeding or meat production',
    images: [
      `${adultChicken1}`,
      `${adultChicken2}`,
    ]
  },
  'dressed-full-chicken': {
    id: 'dressed-full-chicken',
    name: 'Dressed Full Chicken',
    price: 120,
    category: 'Dressed Chicken',
    description: 'Freshly processed full chicken, cleaned and ready for cooking',
    images: [
      `${fullChicken}`,
    ]
  },
  'dressed-chicken-thighs': {
    id: 'dressed-chicken-thighs',
    name: 'Dressed Chicken Thighs',
    price: 70,
    category: 'Dressed Chicken',
    description: 'Freshly processed chicken thighs, cleaned and ready for cooking',
    images: [
      `${chickenThighs}`,
    ]
  },
  'dressed-chicken-back': {
    id: 'dressed-chicken-back',
    name: 'Dressed Chicken Back',
    price: 50,
    category: 'Dressed Chicken',
    description: 'Freshly processed chicken back, cleaned and ready for cooking',
    images: [
      `${chickenBack}`,
    ]
  },
  'dressed-chicken-wings': {
    id: 'dressed-chicken-wings',
    name: 'Dressed Chicken Wings',
    price: 50,
    category: 'Dressed Chicken',
    description: 'Freshly processed chicken wings, cleaned and ready for cooking',
    images: [
      `${chickenWhigs}`,
    ]
  },
  'eggs-small': {
    id: 'eggs-small',
    name: 'Fresh Chicken Eggs (Small)',
    price: 45,
    category: 'Fresh Eggs',
    description: 'A crate of fresh eggs (small sized) from free-range chickens in our farm',
    images: [
      `${egg}`
    ]
  },
  'eggs-medium': {
    id: 'eggs-medium',
    name: 'Fresh Chicken Eggs (Medium)',
    price: 50,
    category: 'Fresh Eggs',
    description: 'A crate of fresh eggs (medium sized) from free-range chickens in our farm',
    images: [
      `${egg}`
    ]
  },
  'eggs-large': {
    id: 'eggs-large',
    name: 'Fresh Chicken Eggs (Large)',
    price: 60,
    category: 'Fresh Eggs',
    description: 'A crate of fresh eggs (large sized) from free-range chickens in our farm',
    images: [
      `${egg}`
    ]
  },
  'eggs-double-yolk': {
    id: 'eggs-double-yolk',
    name: 'Fresh Chicken Eggs (Double Yolk)',
    price: 70,
    category: 'Fresh Eggs',
    description: 'A crate of fresh eggs (double yolk) from free-range chickens in our farm',
    images: [
      `${doubleYolk}`
    ]
  },
  'small-chicken': {
    id: 'live-poultry-small',
    name: 'Live Poultry (Chicks)',
    price: 20,
    category: 'Live Poultry',
    description: 'Young, healthy chicks perfect for starting your own flock',
    images: [
      `${smallChicken1}`,
      `${smallChicken2}`
    ]
  }
};

export const contactInfo = {
  phone: '0555824836, 0545127675',
  location: 'Konongo-Kyekyebiase, Kumasi',
  email: 'info@anvicafarms.com'
};
