import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WorkoutStateService } from '../../core/services/workout-state.service';
import { WorkoutAnalyticsService } from '../../core/services/workout-analytics.service';
import { StrengthProgressPoint } from '../../core/models/workout.model';

interface ChartPoint extends StrengthProgressPoint {
  x: number;
  y: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  state = inject(WorkoutStateService);
  private analytics = inject(WorkoutAnalyticsService);

  // Semana atual (ex: "2026-W47")
  currentWeek = signal<string>(this.state.getCurrentWeekIdentifier());

  // Exercício selecionado para o gráfico de evolução de força
  selectedExerciseId = signal<string>(this.state.exercises()[0]?.id ?? 'supino-reto-barra');

  // Ponto selecionado no hover/clique do gráfico
  hoveredPoint = signal<ChartPoint | null>(null);

  // 1. Volume semanal calculado reativamente
  weeklyVolume = computed(() => {
    return this.analytics
      .getWeeklyVolumeByMuscle(this.currentWeek())
      .sort((a, b) => b.validSets - a.validSets);
  });

  // Total geral de séries e tonelagem na semana
  weeklySummary = computed(() => {
    const list = this.weeklyVolume();
    return {
      totalSets: list.reduce((sum, item) => sum + item.validSets, 0),
      totalTonnage: list.reduce((sum, item) => sum + item.totalTonnage, 0),
      workoutsCount: this.state.logs().filter(l => l.weekIdentifier === this.currentWeek()).length
    };
  });

  // 2. Pontos brutos de progressão do exercício escolhido
  rawProgressPoints = computed(() => {
    return this.analytics.getExerciseStrengthProgression(this.selectedExerciseId());
  });

  // 3. Coordenadas SVG normalizadas (ViewBox 600 x 220) para desenhar a linha do gráfico
  chartData = computed(() => {
    const points = this.rawProgressPoints();
    if (points.length === 0) return { points: [], polyline: '', areaPath: '', min1RM: 0, max1RM: 0 };

    const width = 600;
    const height = 200;
    const padX = 40;
    const padY = 30;

    const values = points.map(p => p.estimated1RM);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 10; // Evita divisão por zero se houver apenas 1 treino

    const mapped: ChartPoint[] = points.map((p, idx) => {
      const x = points.length === 1
        ? width / 2
        : padX + (idx / (points.length - 1)) * (width - padX * 2);

      const normalizedY = (p.estimated1RM - minVal) / range;
      const y = (height - padY) - normalizedY * (height - padY * 2);

      return { ...p, x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
    });

    const polyline = mapped.map(p => `${p.x},${p.y}`).join(' ');
    const first = mapped[0];
    const last = mapped[mapped.length - 1];
    const areaPath = `M ${first.x},${height - 10} L ${mapped.map(p => `${p.x},${p.y}`).join(' L ')} L ${last.x},${height - 10} Z`;

    return {
      points: mapped,
      polyline,
      areaPath,
      min1RM: minVal,
      max1RM: maxVal
    };
  });

  // Retorna percentual para a barra de volume (referência: 20 séries semanais = 100%)
  getVolumePercentage(sets: number): number {
    return Math.min(100, Math.round((sets / 20) * 100));
  }
}