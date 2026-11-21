import { Injectable, signal } from '@angular/core';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../firebase.client';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly isAuthReady = signal<boolean>(false);

  constructor() {
    onAuthStateChanged(auth, user => {
      this.currentUser.set(user);
      this.isAuthReady.set(true);
    });
  }

  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erro ao fazer login com Google:', error);
      alert('Não foi possível concluir o login com Google. Verifique o console.');
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
  }
}