import { DateMaskPipe } from './../../../../core/pipes/date-mask.pipe';
import { CepMaskPipe } from './../../../../core/pipes/cep-mask.pipe';
import { CnpjMaskPipe } from './../../../../core/pipes/cnpj-mask.pipe';
import { CpfMaskPipe } from './../../../../core/pipes/cpf-mask.pipe';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoundsService } from '../../utils/service/rounds.service';
import { CognitoUtil } from '../../../../core/service/cognito/cognito.service';
import { Injector } from '@angular/core';
import { RoundService } from '../../../../core/service/round.service';

declare var toastr: any;
declare var $: any;
declare var bootbox: any;

@Component({
  selector: 'app-investors-list',
  templateUrl: './investors-list.component.html',
  styleUrls: ['./investors-list.component.css']
})
export class InvestorsListComponent implements OnInit {

  idToken: any;
  investors: any;
  rounds: any;
  loader: boolean;
  textRegister = 'Nenhum registro encontrado.';
  p = 1;
  company: any;
  responsive = true;
  labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Próximo'
  };

  constructor(
    private router: Router,
    private roundsService: RoundsService,
    private roundService: RoundService,
    private inj: Injector,
    private cpfMask: CpfMaskPipe,
    private cnpjMask: CnpjMaskPipe,
    private cepMask: CepMaskPipe,
    private dateMask: DateMaskPipe
  ) {}

  ngOnInit() {
    this.loader = true;
    this.getUserCompany();
  }

  getUserCompany() {
    const $this = this;
    const cognitoUtil = this.inj.get(CognitoUtil);
    const cognitoUser = cognitoUtil.getCurrentUser();

    if (cognitoUser != null) {

      cognitoUser.getSession(function (err, session) {
        if (session.isValid() === true && session.isValid() != null) {
          $this.idToken = session.getIdToken().getJwtToken();

          cognitoUser.getUserAttributes(function (erro, result) {
            if (erro) {
              alert(erro);
              return;
            }

            for (let i = 0; i < result.length; i++) {
              if (result[i].getName() === 'custom:managed_company_id') {
                $this.company = result[i].getValue();
                $this.showCompany($this.company);
              }
            }
          });
        }
      });
    }
  }

  showCompany(idCompany: any) {
    const $this = this;
    this.company = idCompany;
    this.roundService.getAllUser().subscribe(
      (response) => {
        this.rounds = response.companiesRounds;
        const comp = this.rounds.filter(a => a.id === Number(this.company));
        this.getUsersInvestments(comp[0].round.id);
      });
  }

  getUsersInvestments(round: number) {
    this.loader = true;
    this.roundsService.getUserInvestment(round).subscribe((response) => {
      this.investors = response;
      this.loader = false;
    }, (error) => {
      toastr.options = {
        'closeButton': true,
        'debug': false,
        'newestOnTop': false,
        'progressBar': true,
        'positionClass': 'toast-top-center',
        'preventDuplicates': true,
        'onclick': null,
        'showDuration': '300',
        'hideDuration': '1000',
        'timeOut': '10000',
        'extendedTimeOut': '1000',
        'showEasing': 'swing',
        'hideEasing': 'linear',
        'showMethod': 'fadeIn',
        'hideMethod': 'fadeOut'
      };
      toastr.error('Ocorreu um erro, entre em contato com o administrador.');
    });
  }

  maskPerfil(perfil) {
    let formatedPerfil = '';
    switch (perfil) {
      case 'ABOVE_MILLION':
        formatedPerfil = 'Acima de 1 milhão';
        break;
      case 'UP_TO_100_THOUSAND':
        formatedPerfil = 'Até 100 mil';
        break;
      case 'UP_TO_10_THOUSAND':
        formatedPerfil = 'Até 10 mil';
        break;
    }
    return formatedPerfil;
  }

  maskStatus(status) {
    let formatedStatus = '';
    switch (status) {
      case 'PENDING':
        formatedStatus = 'Pendente';
        break;
      case 'CONTRACT_SEND':
        formatedStatus = 'Enviado';
        break;
      case 'CONTRACT_SIGNED':
        formatedStatus = 'Assinado';
        break;
      case 'CONFIRMED':
        formatedStatus = 'Confirmado';
        break;
    }
    return formatedStatus;
  }


  routerDetails(investor) {
    this.router.navigate(['company/investors/' + investor.id + '/details']);
  }

  showInvestment(investment) {
    const $this = this;

    let form = '<div class="row"><div class="col-md-8"><div class="form-group"><label class="control-label" for="contractExternalId">Chave Clicksign</label><input value="' + (investment.contractExternalId == null ? '' : investment.contractExternalId) + '" class="form-control"  maxlength="40" type="text" id="contractExternalId"' + (investment.status === 'PENDING' ? '' : 'disabled') + '></div></div>';
    form += '<div class="col-md-4"><div class="form-group"><label class="control-label" for="status">Status</label><select class="form-control" id="status"><option ' + (investment.status === 'PENDING' ? 'selected' : '') + ' value="PENDING">Pendente</option><option ' + (investment.status === 'CONTRACT_SEND' ? 'selected' : '') + ' value="CONTRACT_SEND">Enviado</option><option ' + (investment.status === 'CONTRACT_SIGNED' ? 'selected' : '') + ' value="CONTRACT_SIGNED">Assinado</option><option ' + (investment.status === 'CONFIRMED' ? 'selected' : '') + ' value="CONFIRMED">Confirmado</option></select></div></div>';

    let message = '';
    message += '<div class="row"><div class="col-md-6"><p><b>Profissão: </b>' + investment.investor.profession + '</p></div>';
    message += '<div class="col-md-6"><p><b>E-mail: </b>' + investment.investor.email + '</p></div>';
    message += '<div class="col-md-6"><p>' + (investment.investor.cnpj === undefined ? '<b> CPF: </b>' + this.cpfMask.transform(investment.investor.cpf) : '<b> CNPJ: </b>' + this.cnpjMask.transform(investment.investor.cnpj)) + '</p></div>';
    message += '<div class="col-md-6"><p><b>Politicamente exposta: </b>' + (investment.investor.publicFigure === true ? 'Sim' : 'Não') + '</p></div>';
    message += '<div class="col-md-6"><p><b>RG: </b>' + investment.investor.rg + '</p></div>';
    message += '<div class="col-md-6"><p><b>Orgão emissor: </b>' + investment.investor.rgEmitter + '</p></div>';
    message += '<div class="col-md-6"><p><b>Data de aniversário: </b>' + this.dateMask.transform(investment.investor.dateOfBirth) + '</p></div>';
    message += '<div class="col-md-6"><p><b>Agente: </b>' + (investment.investor.agent == null ? '' : investment.investor.agent) + '</p></div>';
    message += '<div class="col-md-12"><hr style="border-top: 1px solid #ddd;"><p><b>Endereço: </b>' + investment.investor.address.street + ', ' + investment.investor.address.number + '</p></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>Bairro: </b>' + investment.investor.address.neighborhood + '</p></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>Complemento: </b>' + (investment.investor.address.complement == null ? '' : investment.investor.address.complement) + '</p></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>CEP: </b>' + this.cepMask.transform(investment.investor.address.zipCode) + '</p></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>Cidade: </b>' + investment.investor.address.city + ' - ' + investment.investor.address.uf + '</p></div>';
    message += '<div class="col-md-12"><hr style="border-top: 1px solid #ddd;"></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>Data Assinatura: </b>' + this.dateMask.transform(investment.contractSignedAt) + '</p></div>';
    message += '<div class="col-xs-12 col-md-6"><p><b>Data Aporte: </b>' + this.dateMask.transform(investment.confirmedAt) + '</p></div>';
    message += '<div class="col-md-12"><hr style="border-top: 1px solid #ddd;"></div></div>';
    // message += form;
    bootbox.dialog({
      title: '<b>' + investment.investor.fullName + '</b>',
      message: message,
      size: 'large',
      buttons: {
        cancel: {
          label: 'Cancelar',
          className: 'btn-default',
          callback: function () {}
        },
        ok: {
          label: 'OK',
          className: 'bg-upangel'
        }
      }
    });
  }
}
