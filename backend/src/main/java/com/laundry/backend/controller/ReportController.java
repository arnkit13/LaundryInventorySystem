package com.laundry.backend.controller;

import com.laundry.backend.dto.ReportSummary;
import com.laundry.backend.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<List<ReportSummary>> getDailyReport(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getDailyReports(branchId));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<ReportSummary>> getWeeklyReport(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getWeeklyReports(branchId));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<ReportSummary>> getMonthlyReport(@RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getMonthlyReports(branchId));
    }
}
