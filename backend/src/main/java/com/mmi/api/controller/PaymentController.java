package com.mmi.api.controller;

import com.mmi.infra.PaymentRepository;
import com.mmi.models.Payment;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentRepository repository;

    public PaymentController(PaymentRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Payment> list() {
        return repository.findAllWithLeadAndProperty();
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
    }

    @PostMapping
    public Payment create(@RequestBody Payment payment) {
        return repository.save(payment);
    }

    @GetMapping("/month")
    public List<Payment> findPaymentsForMonth(@RequestParam int year, @RequestParam int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return repository.findByDataRecebimentoBetween(start, end);
    }

    @PutMapping("/{id}")
    public Payment update(@PathVariable Long id, @RequestBody Payment updatedPayment) {
        return repository.findById(id).map(p -> {
            p.setValor(updatedPayment.getValor());
            p.setDataRecebimento(updatedPayment.getDataRecebimento());
            p.setDescricao(updatedPayment.getDescricao());
            p.setLead(updatedPayment.getLead());
            return repository.save(p);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pagamento não encontrado");
        }
        repository.deleteById(id);
    }
}
