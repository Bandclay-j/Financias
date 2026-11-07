package com.financeiro.planilha_financeira.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.financeiro.planilha_financeira.dto.DadosCadastroMeta;
import com.financeiro.planilha_financeira.dto.DadosDetalhamentoMeta;
import com.financeiro.planilha_financeira.model.MetaFinanceira;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.MetaFinanceiraRepository;

@Service 
public class MetaFinanceiraService {
    private final MetaFinanceiraRepository repository;

    public MetaFinanceiraService(MetaFinanceiraRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly= true)
    public List<DadosDetalhamentoMeta> listar(Usuario usuario) {
        return repository.findAllByUsuarioIdOrderByPrazoAscIdDesc(usuario.getId())
            .stream().map(DadosDetalhamentoMeta::new).toList();
    }

    @Transactional
    public DadosDetalhamentoMeta criar(DadosCadastroMeta dados, Usuario usuario) {
        MetaFinanceira meta = new MetaFinanceira();
        preencher(meta, dados);
        meta.setUsuario(usuario);
        return new DadosDetalhamentoMeta(repository.save(meta));
    }

    @Transactional
    public DadosDetalhamentoMeta atualizar(Long id, DadosCadastroMeta dados, Usuario usuario) {
        MetaFinanceira meta = repository.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meta financeira não encontrada."));
        preencher(meta, dados);
        return new DadosDetalhamentoMeta(repository.save(meta));
    }

    @Transactional
    public void excluir(Long id, Usuario usuario) {
        MetaFinanceira meta = repository.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meta financeira não encontrada."));
        repository.delete(meta);
    }

    private void preencher(MetaFinanceira meta, DadosCadastroMeta dados) {
        meta.setNome(dados.nome().trim());
        meta.setValorAlvo(dados.valorAlvo());
        meta.setValorAtual(dados.valorAtual());
        meta.setPrazo(dados.prazo());
    }
}
