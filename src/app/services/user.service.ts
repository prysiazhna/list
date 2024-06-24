import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {Task, User} from '../models';
import {MatSnackBar} from "@angular/material/snack-bar";
import {getFromLocalStorage, setToLocalStorage} from "./local-storage.service";

@Injectable({providedIn: 'root'})
export class UserService {
  private currentUser = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUser.asObservable();

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
  ) {
  }
  private getUsers(): User[] {
    return getFromLocalStorage('users') || [];
  }

  private setUsers(users: User[]): void {
    setToLocalStorage('users', users);
  }

  public register(user: User): void {
    const users = this.getUsers();
    this.setUsers([...users, user]);
  }

  public setUserData(user: User): void {
    setToLocalStorage('user', user);
    this.currentUser.next(user);
  }

  public getCurrentUser(): User {
    return getFromLocalStorage('user');
  }

  public login(user: User): void {
    const users = this.getUsers();
    const currentUser = users.find(
      (item: User) =>
        user.username === item.username && user.password === item.password,
    );

    if (currentUser) {
      this.setUserData(currentUser);
      this.router.navigate(['/home']);
    } else {
      this.snackBar.open('Username or password is incorrect', 'Close', {
        duration: 3000,
      });
    }
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.currentUser.next(null as any);
    this.router.navigate(['account/login']);
  }

  public updateUserTasks(tasks: Task[]): void {
    const user = this.getCurrentUser();
    if (user) {
      user.tasks = tasks;
      this.setUserData(user);

      const users = this.getUsers().map((u) =>
        u.username === user.username ? user : u
      );
      this.setUsers(users);
    }
  }
}
