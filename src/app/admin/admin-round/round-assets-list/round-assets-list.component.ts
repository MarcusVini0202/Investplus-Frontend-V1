import { AtivosTipo } from './../../../core/enums/ativos.enum';
import { Component, OnInit } from '@angular/core';
import { RoundService } from '../../../core/service/round.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TitleHeader } from '../../../core/interface/title-header';
import { TitleService } from '../../../core/service/title.service';
import { IIncorporator } from '../components/incorporator/IIncorporator';
import { ICompany } from '../components/company/ICompany';

declare var $: any;
declare var moment: any;
declare var toastr: any;

@Component({
  selector: 'app-round-assets-list',
  templateUrl: './round-assets-list.component.html',
  styleUrls: ['./round-assets-list.component.css']
})
export class RoundAssetsListComponent implements OnInit {

  private allEmpresas: ICompany[] = [];
  private allImobiliarias: IIncorporator[] = [];
  
  empresas: ICompany[] = [];
  imobiliarias: IIncorporator[] = [];

  form: FormGroup;
  titleHeader: TitleHeader;
  filterInvestment = '';
  filterAtivoType = AtivosTipo.STARTUP;

  realStates: any;
  description = '';
  response: any;
  loader: boolean;
  errorMessage = '';
  suggestionMessage = '';
  score = '';
  responseError: boolean;

  public AtivosTipo = AtivosTipo;

  tiposAtivos = [
    { name: 'Imobiliárias', value: AtivosTipo.REALSTATE },
    { name: 'Startups', value: AtivosTipo.STARTUP },
  ];

  p = 1;
  q = 1;
  responsive = true;
  labels: any = {
    previousLabel: 'Anterior',
    nextLabel: 'Próximo'
  };

  constructor(
    private roundService: RoundService,
    private formBuilder: FormBuilder,
    private data: TitleService
  ) { }

  ngOnInit() {
    this.data.currentMessage.subscribe(titles => this.titleHeader = titles);
    this.titleHeader.title = 'Investimentos / Ofertas Públicas';
    this.data.changeTitle(this.titleHeader);

    this.initForm();
    this.loadAllRounds();
  }
  
  selectedText: string = 'Todas as oportunidades';


  setSelectedText(text: string) {
    this.selectedText = text;

    if (text === 'Andamento') {
      this.filterByStatus('IN_PROGRESS');
    } else if (text === 'Concluidas') {
      this.filterByStatus('FINISHED');
    } else {
      this.empresas = [...this.allEmpresas]; // Resetar o filtro
      this.imobiliarias = [...this.allImobiliarias]; // Resetar o filtro
    }
  }

  filterByStatus(status: string) {
    this.empresas = this.allEmpresas.filter(company => company.round.status === status);
    this.imobiliarias = this.allImobiliarias.filter(realState => realState.status === status);
  }  
  

  loadAllRounds() {
    this.loader = true;
    this.responseError = false;

    this.roundService.getAllShortUser().subscribe(
      (response) => {
        this.allEmpresas = response.companiesRounds;
        this.allImobiliarias = response.realStateRounds;
        this.empresas = [...this.allEmpresas]; 
        this.imobiliarias = [...this.allImobiliarias]; 
        this.loader = false;
      }, (error) => {
        this.loader = false;
        this.responseError = true;
        this.errorMessage = 'Problema ao carregar as rodadas de investimento.';
        this.suggestionMessage = 'Recarregue a página ou tente novamente mais tarde.';
      });
  }

  getColor(text: string): string {
    return this.selectedText === text ? '#035A7A' : 'inherit';
  }


  onDevelopmentToast() {
    toastr.options = {
      closeButton: true,
      debug: false,
      newestOnTop: false,
      progressBar: true,
      positionClass: "toast-top-right",
      preventDuplicates: true,
      onclick: null,
      showDuration: "300",
      hideDuration: "1000",
      timeOut: "10000",
      extendedTimeOut: "1000",
      showEasing: "swing",
      hideEasing: "linear",
      showMethod: "fadeIn",
      hideMethod: "fadeOut",
    };
    
    toastr.error('Em desenvolvimento');
  }

  initForm() {
    this.form = this.formBuilder.group({
      typeFilter: [''],
      typeAsset: [AtivosTipo.REALSTATE]
    });
  }
}
