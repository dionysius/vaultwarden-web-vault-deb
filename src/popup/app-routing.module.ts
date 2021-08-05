import { Injectable, NgModule } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouteReuseStrategy,
    RouterModule,
    Routes,
} from '@angular/router';

import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';

import { DebounceNavigationService } from './services/debounceNavigationService';
import { LaunchGuardService } from './services/launch-guard.service';
import { LockGuardService } from './services/lock-guard.service';

import { EnvironmentComponent } from './accounts/environment.component';
import { HintComponent } from './accounts/hint.component';
import { HomeComponent } from './accounts/home.component';
import { LockComponent } from './accounts/lock.component';
import { LoginComponent } from './accounts/login.component';
import { RegisterComponent } from './accounts/register.component';
import { SetPasswordComponent } from './accounts/set-password.component';
import { SsoComponent } from './accounts/sso.component';
import { TwoFactorOptionsComponent } from './accounts/two-factor-options.component';
import { TwoFactorComponent } from './accounts/two-factor.component';
import { UpdateTempPasswordComponent } from './accounts/update-temp-password.component';

import { PasswordGeneratorHistoryComponent } from './generator/password-generator-history.component';
import { PasswordGeneratorComponent } from './generator/password-generator.component';

import { PrivateModeComponent } from './private-mode.component';
import { TabsComponent } from './tabs.component';

import { ExcludedDomainsComponent } from './settings/excluded-domains.component';
import { ExportComponent } from './settings/export.component';
import { FolderAddEditComponent } from './settings/folder-add-edit.component';
import { FoldersComponent } from './settings/folders.component';
import { OptionsComponent } from './settings/options.component';
import { PremiumComponent } from './settings/premium.component';
import { SettingsComponent } from './settings/settings.component';
import { SyncComponent } from './settings/sync.component';

import { AddEditComponent } from './vault/add-edit.component';
import { AttachmentsComponent } from './vault/attachments.component';
import { CiphersComponent } from './vault/ciphers.component';
import { CollectionsComponent } from './vault/collections.component';
import { CurrentTabComponent } from './vault/current-tab.component';
import { GroupingsComponent } from './vault/groupings.component';
import { PasswordHistoryComponent } from './vault/password-history.component';
import { ShareComponent } from './vault/share.component';
import { ViewComponent } from './vault/view.component';

import { SendAddEditComponent } from './send/send-add-edit.component';
import { SendGroupingsComponent } from './send/send-groupings.component';
import { SendTypeComponent } from './send/send-type.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    {
        path: 'vault',
        redirectTo: '/tabs/vault',
        pathMatch: 'full',
    },
    {
        path: 'home',
        component: HomeComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'home' },
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'login' },
    },
    {
        path: 'lock',
        component: LockComponent,
        canActivate: [LockGuardService],
        data: { state: 'lock' },
    },
    {
        path: '2fa',
        component: TwoFactorComponent,
        canActivate: [LaunchGuardService],
        data: { state: '2fa' },
    },
    {
        path: '2fa-options',
        component: TwoFactorOptionsComponent,
        canActivate: [LaunchGuardService],
        data: { state: '2fa-options' },
    },
    {
        path: 'sso',
        component: SsoComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'sso' },
    },
    {
        path: 'set-password',
        component: SetPasswordComponent,
        data: { state: 'set-password' },
    },
    {
        path: 'register',
        component: RegisterComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'register' },
    },
    {
        path: 'hint',
        component: HintComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'hint' },
    },
    {
        path: 'environment',
        component: EnvironmentComponent,
        canActivate: [LaunchGuardService],
        data: { state: 'environment' },
    },
    {
        path: 'ciphers',
        component: CiphersComponent,
        canActivate: [AuthGuardService],
        data: { state: 'ciphers' },
    },
    {
        path: 'view-cipher',
        component: ViewComponent,
        canActivate: [AuthGuardService],
        data: { state: 'view-cipher' },
    },
    {
        path: 'cipher-password-history',
        component: PasswordHistoryComponent,
        canActivate: [AuthGuardService],
        data: { state: 'cipher-password-history' },
    },
    {
        path: 'add-cipher',
        component: AddEditComponent,
        canActivate: [AuthGuardService, DebounceNavigationService],
        data: { state: 'add-cipher' },
        runGuardsAndResolvers: 'always',
    },
    {
        path: 'edit-cipher',
        component: AddEditComponent,
        canActivate: [AuthGuardService, DebounceNavigationService],
        data: { state: 'edit-cipher' },
        runGuardsAndResolvers: 'always',
    },
    {
        path: 'share-cipher',
        component: ShareComponent,
        canActivate: [AuthGuardService],
        data: { state: 'share-cipher' },
    },
    {
        path: 'collections',
        component: CollectionsComponent,
        canActivate: [AuthGuardService],
        data: { state: 'collections' },
    },
    {
        path: 'attachments',
        component: AttachmentsComponent,
        canActivate: [AuthGuardService],
        data: { state: 'attachments' },
    },
    {
        path: 'generator',
        component: PasswordGeneratorComponent,
        canActivate: [AuthGuardService],
        data: { state: 'generator' },
    },
    {
        path: 'generator-history',
        component: PasswordGeneratorHistoryComponent,
        canActivate: [AuthGuardService],
        data: { state: 'generator-history' },
    },
    {
        path: 'export',
        component: ExportComponent,
        canActivate: [AuthGuardService],
        data: { state: 'export' },
    },
    {
        path: 'folders',
        component: FoldersComponent,
        canActivate: [AuthGuardService],
        data: { state: 'folders' },
    },
    {
        path: 'add-folder',
        component: FolderAddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'add-folder' },
    },
    {
        path: 'edit-folder',
        component: FolderAddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'edit-folder' },
    },
    {
        path: 'sync',
        component: SyncComponent,
        canActivate: [AuthGuardService],
        data: { state: 'sync' },
    },
    {
        path: 'excluded-domains',
        component: ExcludedDomainsComponent,
        canActivate: [AuthGuardService],
        data: { state: 'excluded-domains' },
    },
    {
        path: 'premium',
        component: PremiumComponent,
        canActivate: [AuthGuardService],
        data: { state: 'premium' },
    },
    {
        path: 'options',
        component: OptionsComponent,
        canActivate: [AuthGuardService],
        data: { state: 'options' },
    },
    {
        path: 'private-mode',
        component: PrivateModeComponent,
        data: { state: 'private-mode' },
    },
    {
        path: 'clone-cipher',
        component: AddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'clone-cipher' },
    },
    {
        path: 'send-type',
        component: SendTypeComponent,
        canActivate: [AuthGuardService],
        data: { state: 'send-type' },
    },
    {
        path: 'add-send',
        component: SendAddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'add-send' },
    },
    {
        path: 'edit-send',
        component: SendAddEditComponent,
        canActivate: [AuthGuardService],
        data: { state: 'edit-send' },
    },
    {
        path: 'update-temp-password',
        component: UpdateTempPasswordComponent,
        canActivate: [AuthGuardService],
        data: { state: 'update-temp-password' },
    },
    {
        path: 'tabs',
        component: TabsComponent,
        data: { state: 'tabs' },
        children: [
            {
                path: '',
                redirectTo: '/tabs/vault',
                pathMatch: 'full',
            },
            {
                path: 'current',
                component: CurrentTabComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_current' },
                runGuardsAndResolvers: 'always',
            },
            {
                path: 'vault',
                component: GroupingsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_vault' },
            },
            {
                path: 'generator',
                component: PasswordGeneratorComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_generator' },
            },
            {
                path: 'settings',
                component: SettingsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_settings' },
            },
            {
                path: 'send',
                component: SendGroupingsComponent,
                canActivate: [AuthGuardService],
                data: { state: 'tabs_send' },
            },
        ],
    },
];

@Injectable()
export class NoRouteReuseStrategy implements RouteReuseStrategy {
    shouldDetach(route: ActivatedRouteSnapshot) {
        return false;
    }

    store(route: ActivatedRouteSnapshot, handle: {}) { /* Nothing */ }

    shouldAttach(route: ActivatedRouteSnapshot) {
        return false;
    }

    retrieve(route: ActivatedRouteSnapshot): any {
        return null;
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot) {
        return false;
    }
}

@NgModule({
    imports: [RouterModule.forRoot(routes, {
        useHash: true,
        onSameUrlNavigation: 'reload',
        /*enableTracing: true,*/
    })],
    exports: [RouterModule],
    providers: [
        { provide: RouteReuseStrategy, useClass: NoRouteReuseStrategy },
    ],
})
export class AppRoutingModule { }
