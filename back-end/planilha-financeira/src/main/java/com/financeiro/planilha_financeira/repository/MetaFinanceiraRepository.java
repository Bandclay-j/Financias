package com.financeiro.planilha_financeira.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.financeiro.planilha_financeira.model.MetaFinanceira;

public interface MetaFinanceiraRepository extends JpaRepository<MetaFinanceira, Long> {
    List<MetaFinanceira> findAllByUsuarioIdOrderByPrazoAscIdDesc(Long usuarioId);
    Optional<MetaFinanceira> findByIdAndUsuarioId(Long id, Long usuarioId);
}
