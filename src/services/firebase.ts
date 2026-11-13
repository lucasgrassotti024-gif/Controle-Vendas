import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcqZ-jwbqx_LaCXip7K1l15jrNntMqQkI",
  authDomain: "controle-vendas-14b59.firebaseapp.com",
  projectId: "controle-vendas-14b59",
  storageBucket: "controle-vendas-14b59.firebasestorage.app",
  messagingSenderId: "933575177795",
  appId: "1:933575177795:web:740f2c2a0e6b42e9de46f6",
  measurementId: "G-C5LHZ73R9G"
};

// Inicializa o app Firebase
export const firebaseApp = initializeApp(firebaseConfig);

// Instância do Cloud Firestore para sincronização em tempo real
export const db = getFirestore(firebaseApp);
