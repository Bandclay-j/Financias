package com.financeiro.planilha_financeira.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.financeiro.planilha_financeira.dto.DadosDetalhamentoOrcamento;
import com.financeiro.planilha_financeira.model.Usuario;
import com.financeiro.planilha_financeira.repository.OrcamentoRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.financeiro.planilha_financeira.dto.DadosCadastroOrcamento;
import com.financeiro.planilha_financeira.model.Orcamento;

@Service 
public class OrcamentoService {
    private final OrcamentoRepository repository;

    public OrcamentoService(OrcamentoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly= true)
    public List<DadosDetalhamentoOrcamento> listar(Usuario usuario) {
        return repository.findAllByUsuarioIdOrderByMesDescCategoriaAsc(usuario.getId())
            .stream().map(DadosDetalhamentoOrcamento::new).toList();
    }

    @Transactional
    public DadosDetalhamentoOrcamento criar(DadosCadastroOrcamento dados, Usuario usuario) {
        validarDuplicidade(dados, usuario, null);
        Orcamento o = new Orcamento();
        preencher(o, dados);
        o.setUsuario(usuario);
        return new DadosDetalhamentoOrcamento(repository.save(o));
    }

    @Transactional
    public DadosDetalhamentoOrcamento atualizar(Long id, DadosCadastroOrcamento dados, Usuario usuario) {
        Orcamento o = repository.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));
        validarDuplicidade(dados, usuario, id);
        preencher(o, dados);
        return new DadosDetalhamentoOrcamento(repository.save(o));
    }

    @Transactional
    public void excluir(Long id, Usuario usuario) {
        Orcamento o = repository.findByIdAndUsuarioId(id, usuario.getId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orçamento não encontrado."));
        repository.delete(o);
    }

    private void validarDuplicidade(DadosCadastroOrcamento dados, Usuario usuario, Long idAtual) {
        boolean existe = repository.existsByUsuarioIdAndCategoriaIgnoreCaseAndMes(
            usuario.getId(), dados.categoria().trim(), dados.mes());
        if (existe && (idAtual == null || !repository.findByIdAndUsuarioId(idAtual, usuario.getId())
            .map(o -> o.getCategoria().equalsIgnoreCase(dados.categoria().trim()) && 
        o.getMes().equals(dados.mes()))
            .orElse(false))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Já existe orçamento para essa categoria neste mês.");
        }
    }

    private void preencher(Orcamento o, DadosCadastroOrcamento dados) {
        o.setCategoria(dados.categoria().trim());
        o.setLimite(dados.limite());
        o.setMes(dados.mes());
    }
}
