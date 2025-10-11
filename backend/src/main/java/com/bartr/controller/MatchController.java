package com.bartr.controller;

import com.bartr.model.entity.Match;
import com.bartr.service.MatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/matches")
public class MatchController {
    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping("/potential/{listingId}")
    public ResponseEntity<List<Match>> findPotentialMatches(@PathVariable Long listingId) {
        return ResponseEntity.ok(matchService.findPotentialMatches(listingId));
    }

    @PostMapping
    public ResponseEntity<Match> createMatch(
        @RequestParam Long listing1Id,
        @RequestParam Long listing2Id
    ) {
        Match match = matchService.createMatch(listing1Id, listing2Id);
        return ResponseEntity.ok(match);
    }
}