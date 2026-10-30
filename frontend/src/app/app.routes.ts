import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { PublicacionesComponent } from './pages/publicaciones/publicaciones.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'publicaciones',
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard],
    title: 'Iniciar Sesión | Conecta',
  },
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [publicGuard],
    title: 'Crear Cuenta | Conecta',
  },
  {
    path: 'publicaciones',
    component: PublicacionesComponent,
    canActivate: [authGuard],
    title: 'Publicaciones | Conecta',
  },
  {
    path: 'mi-perfil',
    component: MiPerfilComponent,
    canActivate: [authGuard],
    title: 'Mi Perfil | Conecta',
  },
  {
    path: '**',
    redirectTo: 'publicaciones',
  },
];
