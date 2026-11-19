import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsuariosComponent } from './usuarios.component';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { ToastService } from '../../../services/toast.service';
import { provideRouter } from '@angular/router';

describe('UsuariosComponent', () => {
  let component: UsuariosComponent;
  let mockUsuariosService: any;
  let mockAuthService: any;
  let mockModalService: any;
  let mockToastService: any;

  beforeEach(() => {
    mockUsuariosService = {
      listarUsuarios: vi.fn().mockReturnValue(of([])),
      crearUsuario: vi.fn(),
      deshabilitarUsuario: vi.fn(),
      habilitarUsuario: vi.fn(),
    };
    mockAuthService = {
      getAvatarUrl: vi.fn().mockReturnValue('/uploads/avatar.png'),
    };
    mockModalService = {
      confirm: vi.fn((titulo, mensaje, onConfirm) => onConfirm()),
    };
    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: [
        provideRouter([]),
        { provide: UsuariosService, useValue: mockUsuariosService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ModalService, useValue: mockModalService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });

    const fixture = TestBed.createComponent(UsuariosComponent);
    component = fixture.componentInstance;
  });

  it('debe inicializarse y cargar los usuarios', () => {
    const listaUsuarios = [
      {
        _id: '1',
        nombre: 'Spy',
        apellido: 'Red',
        username: 'spy',
        email: 'spy@mannco.com',
        perfil: 'usuario',
        activo: true,
      },
    ];
    mockUsuariosService.listarUsuarios.mockReturnValue(of(listaUsuarios));

    component.ngOnInit();

    expect(component.usuarios()).toEqual(listaUsuarios);
    expect(component.estaCargando()).toBe(false);
  });

  it('debe alternar la visibilidad del formulario de nuevo agente', () => {
    expect(component.mostrarFormulario()).toBe(false);
    component.toggleFormulario();
    expect(component.mostrarFormulario()).toBe(true);
    component.toggleFormulario();
    expect(component.mostrarFormulario()).toBe(false);
  });

  it('debe validar formulario antes de crear', () => {
    component.guardarNuevoUsuario();
    expect(component.usuarioForm.invalid).toBe(true);
    expect(mockToastService.error).toHaveBeenCalled();
  });

  it('debe solicitar confirmación y deshabilitar usuario', () => {
    const mockUser: any = {
      _id: 'u1',
      nombre: 'Demo',
      apellido: 'Man',
      username: 'demoman',
      activo: true,
    };
    mockUsuariosService.deshabilitarUsuario.mockReturnValue(of({}));

    component.confirmarDeshabilitar(mockUser);
    expect(mockModalService.confirm).toHaveBeenCalled();
    expect(mockUsuariosService.deshabilitarUsuario).toHaveBeenCalledWith('u1');
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('debe solicitar confirmación y habilitar usuario', () => {
    const mockUser: any = {
      _id: 'u2',
      nombre: 'Heavy',
      apellido: 'Weapons',
      username: 'heavy',
      activo: false,
    };
    mockUsuariosService.habilitarUsuario.mockReturnValue(of({}));

    component.confirmarHabilitar(mockUser);
    expect(mockModalService.confirm).toHaveBeenCalled();
    expect(mockUsuariosService.habilitarUsuario).toHaveBeenCalledWith('u2');
    expect(mockToastService.success).toHaveBeenCalled();
  });
});
